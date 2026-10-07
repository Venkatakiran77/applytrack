package com.applytrack.api.jd.dto;

import jakarta.validation.constraints.*;

public record MatchRequest(@NotBlank @Size(max = 20000) String jdText) {}