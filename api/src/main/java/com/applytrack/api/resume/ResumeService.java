package com.applytrack.api.resume;

import com.applytrack.api.application.ApplicationRepository;
import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.jd.KeywordExtractor;
import com.applytrack.api.user.User;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ResumeService {
    private static final long MAX_BYTES = 2 * 1024 * 1024;
    private static final Set<String> ALLOWED_EXT = Set.of("pdf", "doc", "docx");

    private final ResumeRepository repo;
    private final GridFsTemplate gridFs;
    private final ResumeTextExtractor extractor;       // <-- Add this
    private final KeywordExtractor keywordExtractor;   // <-- Add this
    private final ApplicationRepository applicationRepository; // <-- Needed for delete check later


    public List<ResumeResponse> list(User user) {
        return repo.findByUserOrderByUploadedAtDesc(user).stream().map(ResumeResponse::from).toList();
    }

    @Transactional
    public ResumeResponse upload(User user, String name, MultipartFile file) throws IOException {
        String original = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "resume"));
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.') + 1).toLowerCase() : "";
        if (!ALLOWED_EXT.contains(ext))
            throw new IllegalArgumentException("Only PDF, DOC or DOCX files are allowed");

        // 1. Extract text and validate it's not a scanned/empty file
        String text = extractor.extract(file, ext);
        if (text == null || text.isBlank())
            throw new IllegalArgumentException("Could not read text from this file (scanned PDFs are not supported)");

        // 2. Extract keywords using your keyword extractor
        Set<String> found = keywordExtractor.extract(text);

        String clean = name == null ? "" : name.trim();
        if (clean.isEmpty() || clean.length() > 60)
            throw new IllegalArgumentException("Name must be 1 to 60 characters");
        if (file.isEmpty() || file.getSize() > MAX_BYTES)
            throw new IllegalArgumentException("File must be under 2 MB");

        if (repo.existsByUserAndNameIgnoreCase(user, clean))
            throw new IllegalArgumentException("You already have a resume named " + clean);

        // 3. Store file bytes in MongoDB GridFS first
        ObjectId fileId;
        try (InputStream in = file.getInputStream()) {
            fileId = gridFs.store(in, original, file.getContentType());
        }

        // 4. Build and save the metadata entity along with the extracted keywords
        Resume r = new Resume();
        r.setUser(user);
        r.setName(clean);
        r.setFileName(original);
        r.setContentType(file.getContentType());
        r.setSizeBytes(file.getSize());
        r.setFileId(fileId.toHexString());

        // Fix: collect cleanly as a Set<String>
        r.setKeywords(found != null ? new java.util.HashSet<>(found) : new java.util.HashSet<>());

        try {
            return ResumeResponse.from(repo.save(r));
        } catch (RuntimeException e) {
            gridFs.delete(Query.query(Criteria.where("_id").is(fileId)));
            throw e;
        }
    }
    public Resume getOwned(User user, Long id) {
        return repo.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
    }

    public Resource open(Resume r) {
        GridFSFile f = gridFs.findOne(Query.query(Criteria.where("_id").is(new ObjectId(r.getFileId()))));
        if (f == null) throw new ResourceNotFoundException("File missing");
        return gridFs.getResource(f);
    }

    @Transactional
    public void delete(User user, Long id) {
        Resume r = getOwned(user, id);
        gridFs.delete(Query.query(Criteria.where("_id").is(new ObjectId(r.getFileId()))));
        repo.delete(r);
        if (applicationRepository.existsByResume(r))
            throw new IllegalArgumentException("This resume is linked to applications. Change those first.");
    }
}
