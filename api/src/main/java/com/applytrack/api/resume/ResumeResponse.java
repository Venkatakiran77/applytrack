package com.applytrack.api.resume;

import java.time.Instant;
public record ResumeResponse(Long id, String name, String fileName, long sizeBytes, Instant uploadedAt, int keyword) {
    public static ResumeResponse from(Resume r) {
        return new ResumeResponse(r.getId(), r.getName(), r.getFileName(), r.getSizeBytes(), r.getUploadedAt(), r.getKeywords().size());
    }
}
