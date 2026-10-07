package com.applytrack.api.application.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record ApplicationRequest(
        @NotBlank @Size(max = 255) String company,
        @NotBlank @Size(max = 255) String role,
        @Size(max = 1000) String jobUrl,
        @Size(max = 100) String resumeVersion,
        LocalDate appliedOn,
        @Size(max = 5000) String notes) {}