package com.applytrack.api.application.dto;

import com.applytrack.api.application.*;
import java.time.*;

public record ApplicationResponse(
        Long id, String company, String role, String jobUrl, String resumeVersion,
        ApplicationStatus status, LocalDate appliedOn, Instant lastUpdated, String notes) {

    public static ApplicationResponse from(JobApplication a) {
        return new ApplicationResponse(a.getId(), a.getCompany(), a.getRole(), a.getJobUrl(),
                a.getResumeVersion(), a.getStatus(), a.getAppliedOn(), a.getLastUpdated(), a.getNotes());
    }
}