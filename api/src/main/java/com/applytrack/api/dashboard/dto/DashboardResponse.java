package com.applytrack.api.dashboard.dto;

import com.applytrack.api.application.ApplicationStatus;
import java.util.*;

public record DashboardResponse(long totalApplications,
                                Map<ApplicationStatus, Long> byStatus,
                                List<ResumeStat> resumeStats,
                                List<KeywordCount> topMissingKeywords) {}