package com.applytrack.api.jd;

import com.applytrack.api.application.*;
import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.jd.dto.*;
import com.applytrack.api.resume.Resume;
import com.applytrack.api.skills.*;
import com.applytrack.api.user.User;
import com.applytrack.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final ApplicationRepository applicationRepository;
    private final SkillRepository skillRepository;
    private final JobDescriptionRepository jdRepository;
    private final KeywordExtractor keywordExtractor;
    private final UserRepository userRepository;

    @Transactional
    public MatchResponse match(String email, Long applicationId, MatchRequest req) {
        // 1. Fetch user and verify application ownership
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        JobApplication app = applicationRepository.findByIdAndUserEmail(applicationId, email)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // 2. Get the linked resume from the application (if any)
        Resume resume = app.getResume();

        // 3. Determine keyword comparison source
        boolean usingResume = resume != null
                && resume.getKeywords() != null
                && !resume.getKeywords().isEmpty();

        Set<String> have = new HashSet<>();
        if (usingResume) {
            have.addAll(resume.getKeywords());
        } else {
            skillRepository.findByUserEmailOrderByNameAsc(email)
                    .forEach(s -> have.add(s.getName().toLowerCase()));
        }

        Set<String> extracted = keywordExtractor.extract(req.jdText());

        Set<String> matched = extracted.stream().filter(have::contains).collect(Collectors.toCollection(TreeSet::new));
        Set<String> missing = extracted.stream().filter(k -> !have.contains(k)).collect(Collectors.toCollection(TreeSet::new));

        double score = extracted.isEmpty()
                ? 0.0
                : Math.round(matched.size() * 1000.0 / extracted.size()) / 10.0;

        // 4. Save analysis results to MongoDB (with resumeId reference)
        JobDescriptionDoc doc = jdRepository.findByApplicationId(applicationId)
                .orElseGet(JobDescriptionDoc::new);

        doc.setApplicationId(applicationId);
        doc.setUserId(user.getId());
        doc.setResumeId(usingResume ? resume.getId() : null);
        doc.setRawText(req.jdText());
        doc.setExtractedKeywords(List.copyOf(extracted));
        doc.setMatchedKeywords(new ArrayList<>(matched));
        doc.setMissingKeywords(new ArrayList<>(missing));
        doc.setMatchScore(score);
        doc.setAnalyzedAt(Instant.now());
        jdRepository.save(doc);

        // 5. Generate basis string
        // 5. Generate basis string
        String basis;
        if (usingResume) {
            basis = "Resume: " + resume.getName();
        } else if (resume != null) {
            basis = "Resume \"" + resume.getName() + "\" has no detected skills (re-upload it). Using Skills list";
        } else {
            basis = "Skills list (no resume linked)";
        }

        return new MatchResponse(
                applicationId,
                score,
                List.copyOf(extracted),
                new ArrayList<>(matched),
                new ArrayList<>(missing),
                basis
        );
    }

    @Transactional(readOnly = true)
    public MatchResponse latest(String email, Long applicationId) {
        JobApplication app = applicationRepository.findByIdAndUserEmail(applicationId, email)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        JobDescriptionDoc doc = jdRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("No analysis yet for this application"));

        Resume resume = app.getResume();
        String basis = (doc.getResumeId() != null && resume != null && doc.getResumeId().equals(resume.getId()))
                ? "Resume: " + resume.getName()
                : "Skills list (no resume linked)";

        return new MatchResponse(
                applicationId,
                doc.getMatchScore(),
                doc.getExtractedKeywords(),
                doc.getMatchedKeywords(),
                doc.getMissingKeywords(),
                basis
        );
    }
}