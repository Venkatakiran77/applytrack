package com.applytrack.api.dashboard.dto;

import com.applytrack.api.dashboard.dto.KeywordCount;

import java.util.List;

public record ResumeMissingSkills(Long resumeId, String resumeName,
                                  int applicationsAnalyzed, List<KeywordCount> skills) {}