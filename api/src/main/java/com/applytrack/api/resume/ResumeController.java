package com.applytrack.api.resume;

import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.jd.dto.MatchRequest;
import com.applytrack.api.jd.dto.MatchResponse;
import com.applytrack.api.user.User;
import com.applytrack.api.user.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {
    private final ResumeService service;
    private final UserRepository userRepository;
    private final ResumeCheckService checkService;


    private User currentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping
    public List<ResumeResponse> list(Principal principal) {
        return service.list(currentUser(principal));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResumeResponse upload(Principal principal,
                                 @RequestParam String name,
                                 @RequestParam MultipartFile file) throws IOException {
        return service.upload(currentUser(principal), name, file);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(Principal principal, @PathVariable Long id) {
        Resume r = service.getOwned(currentUser(principal), id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        r.getContentType() != null ? r.getContentType() : "application/octet-stream"))
                .contentLength(r.getSizeBytes())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(r.getFileName()).build().toString())
                .body(service.open(r));
    }
    @PostMapping("/{id}/check")
    public MatchResponse check(Principal principal,
                               @PathVariable Long id,
                               @Valid @RequestBody MatchRequest req) {
        Resume r = service.getOwned(currentUser(principal), id);
        return checkService.check(r, req.jdText());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        service.delete(currentUser(principal), id);
        return ResponseEntity.noContent().build();
    }
}