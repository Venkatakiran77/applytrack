package com.applytrack.api.skills.dto;

import jakarta.validation.constraints.*;

public record SkillRequest(@NotBlank @Size(max = 100) String name) {}