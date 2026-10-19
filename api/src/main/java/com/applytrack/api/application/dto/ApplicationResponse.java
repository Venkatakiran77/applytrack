package com.applytrack.api.application.dto;

import com.applytrack.api.application.*;
import java.time.*;

public record ApplicationResponse(
        Long id, String company, String role, String jobUrl, String resumeVersion,
        Long resumeId, // <-- Added resumeId here
        ApplicationStatus status, LocalDate appliedOn, Instant lastUpdated, String notes, boolean followUpNeeded) {

    public static ApplicationResponse from(JobApplication a) {
        return new ApplicationResponse(
                a.getId(),
                a.getCompany(),
                a.getRole(),
                a.getJobUrl(),
                a.getResumeVersion(),
                a.getResume() != null ? a.getResume().getId() : null, // <-- Maps resume entity ID safely
                a.getStatus(),
                a.getAppliedOn(),
                a.getLastUpdated(),
                a.getNotes(),
                a.isFollowUpNeeded()
        );
    }
}