package com.applytrack.api.application.dto;

import com.applytrack.api.application.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull ApplicationStatus status) {}