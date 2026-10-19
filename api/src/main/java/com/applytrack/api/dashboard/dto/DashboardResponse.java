package com.applytrack.api.dashboard.dto;

import com.applytrack.api.application.ApplicationStatus;
import java.util.List;
import java.util.Map;

public record DashboardResponse(
        long totalApplications,
        Map<ApplicationStatus, Long> byStatus,
        List<ResumeStat> resumeStats,
        List<KeywordCount> topMissingKeywords,
        List<ResumeMissingSkills> missingByResume
) {}