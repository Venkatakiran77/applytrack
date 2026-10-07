package com.applytrack.api.reminder;

import com.applytrack.api.application.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FollowUpScheduler {

    private final ApplicationRepository applicationRepository;

    @Value("${app.followup-days}")
    private long followUpDays;

    @Scheduled(cron = "${app.followup-cron}", zone = "Asia/Kolkata")
    @Transactional
    public void flagStaleApplications() {
        Instant cutoff = Instant.now().minus(Duration.ofDays(followUpDays));
        int flagged = applicationRepository.flagStale(
                List.of(ApplicationStatus.APPLIED, ApplicationStatus.SCREENING), cutoff);
        log.info("Follow-up job: flagged {} application(s) with no update for {}+ days",
                flagged, followUpDays);
    }
}