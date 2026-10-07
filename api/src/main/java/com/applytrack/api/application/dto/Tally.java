package com.applytrack.api.application.dto;

import com.applytrack.api.application.ApplicationStatus;

public record Tally(String resumeVersion, ApplicationStatus status, Long count) {}