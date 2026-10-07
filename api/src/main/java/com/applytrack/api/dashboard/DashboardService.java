package com.applytrack.api.dashboard;

import com.applytrack.api.application.*;
import com.applytrack.api.application.dto.Tally;
import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.dashboard.dto.*;
import com.applytrack.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    // "Responded" = the company moved you past APPLIED into a real stage.
    private static final Set<ApplicationStatus> RESPONDED =
            EnumSet.of(ApplicationStatus.SCREENING, ApplicationStatus.INTERVIEW, ApplicationStatus.OFFER);

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    @Transactional(readOnly = true)
    public DashboardResponse summary(String email) {
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")).getId();

        List<Tally> tallies = applicationRepository.tallyByResumeAndStatus(email);

        // 1) counts per status, zero-filled so the UI always gets every key
        Map<ApplicationStatus, Long> byStatus = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus s : ApplicationStatus.values()) byStatus.put(s, 0L);
        tallies.forEach(t -> byStatus.merge(t.status(), t.count(), Long::sum));

        // 2) response rate per resume version
        Map<String, long[]> perResume = new TreeMap<>(); // [total, responded]
        for (Tally t : tallies) {
            String key = (t.resumeVersion() == null || t.resumeVersion().isBlank())
                    ? "unspecified" : t.resumeVersion();
            long[] agg = perResume.computeIfAbsent(key, k -> new long[2]);
            agg[0] += t.count();
            if (RESPONDED.contains(t.status())) agg[1] += t.count();
        }
        List<ResumeStat> resumeStats = perResume.entrySet().stream()
                .map(e -> new ResumeStat(e.getKey(), e.getValue()[0], e.getValue()[1],
                        Math.round(e.getValue()[1] * 1000.0 / e.getValue()[0]) / 10.0))
                .toList();

        long total = byStatus.values().stream().mapToLong(Long::longValue).sum();
        return new DashboardResponse(total, byStatus, resumeStats, topMissingKeywords(userId));
    }

    // 3) MongoDB aggregation: which skills do your target JDs ask for that you lack?
    private List<KeywordCount> topMissingKeywords(Long userId) {
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("userId").is(userId)),
                Aggregation.unwind("missingKeywords"),
                Aggregation.group("missingKeywords").count().as("count"),
                Aggregation.project("count").and("keyword").previousOperation(),
                Aggregation.sort(Sort.Direction.DESC, "count"),
                Aggregation.limit(10));
        return mongoTemplate.aggregate(agg, "job_descriptions", KeywordCount.class)
                .getMappedResults();
    }
}