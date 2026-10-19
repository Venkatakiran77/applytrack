package com.applytrack.api.jd.dto;

import java.util.List;

public record MatchResponse(
        Long applicationId,
        double score,
        List<String> extractedKeywords,
        List<String> matchedKeywords,
        List<String> missingKeywords,
        String basis
) {}