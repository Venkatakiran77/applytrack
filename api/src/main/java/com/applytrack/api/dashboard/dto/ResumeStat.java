package com.applytrack.api.dashboard.dto;

public record ResumeStat(String resumeVersion, long total, long responded, double responseRate) {}