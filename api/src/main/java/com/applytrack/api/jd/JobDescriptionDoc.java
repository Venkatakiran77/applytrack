package com.applytrack.api.jd;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "job_descriptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobDescriptionDoc {

    @Id
    private String id;

    private Long applicationId;
    private Long userId;
    private String rawText;
    private List<String> extractedKeywords;
    private List<String> matchedKeywords;
    private List<String> missingKeywords;
    private double matchScore;
    private Instant analyzedAt;
}