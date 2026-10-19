package com.applytrack.api.dashboard;

import com.applytrack.api.application.*;
        import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.dashboard.dto.*;
        import com.applytrack.api.user.User;
import com.applytrack.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final List<ApplicationStatus> RESPONDED =
            List.of(ApplicationStatus.SCREENING, ApplicationStatus.INTERVIEW, ApplicationStatus.OFFER);

    private record AppAnalysis(Long resumeId, Set<String> missing) {}

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    @Transactional(readOnly = true)
    public DashboardResponse summary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1) Fetch application tallies by status for zero-filled status breakdown map
        List<JobApplication> userApps = applicationRepository.findByUserEmail(email, org.springframework.data.domain.Pageable.unpaged()).getContent();
        Map<ApplicationStatus, Long> byStatus = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus s : ApplicationStatus.values()) byStatus.put(s, 0L);
        userApps.forEach(app -> byStatus.merge(app.getStatus(), 1L, Long::sum));


        log.info("========== DASHBOARD RESUME STATS DEBUG ==========");
        log.info("User email: {}", email);
        log.info("User ID: {}", user.getId());

        List<ResumeStat> resumeStats = applicationRepository
                .resumeStats(user, RESPONDED)
                .stream()
                .map(c -> {
                    log.info(
                            "Resume aggregation result -> resume={}, applied={}, responses={}",
                            c.resume(),
                            c.applied(),
                            c.responses()
                    );

                    double responseRate = c.applied() == 0
                            ? 0.0
                            : Math.round(c.responses() * 1000.0 / c.applied()) / 10.0;

                    log.info("Calculated responseRate for resume {}: {}%",
                            c.resume(), responseRate);

                    ResumeStat stat = new ResumeStat(
                            c.resume(),
                            c.applied(),
                            c.responses(),
                            responseRate
                    );

                    log.info("Created ResumeStat object: {}", stat);

                    return stat;
                })
                .toList();

        log.info("Total resumeStats records: {}", resumeStats.size());
        log.info("Final resumeStats list: {}", resumeStats);
        log.info("==================================================");
        // Applications linked to a resume, excluding saved applications
        Map<Long, List<JobApplication>> byResume = userApps.stream()
                .filter(a -> a.getResume() != null)
                .filter(a -> a.getStatus() != ApplicationStatus.SAVED)
                .collect(Collectors.groupingBy(
                        a -> a.getResume().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<Long> candidateIds = byResume.values().stream()
                .flatMap(List::stream)
                .map(JobApplication::getId)
                .toList();

        Map<Long, AppAnalysis> analyses =
                analysisByApplication(user.getId(), candidateIds);

        List<ResumeMissingSkills> missingByResume = new ArrayList<>();
        List<Long> allValidIds = new ArrayList<>();

        byResume.forEach((resumeId, apps) -> {
            // Exclude analyses performed against a different resume
            List<Long> ids = apps.stream()
                    .map(JobApplication::getId)
                    .filter(id -> {
                        AppAnalysis analysis = analyses.get(id);
                        return analysis != null
                                && resumeId.equals(analysis.resumeId());
                    })
                    .toList();

            if (ids.isEmpty()) {
                return;
            }

            allValidIds.addAll(ids);

            missingByResume.add(new ResumeMissingSkills(
                    resumeId,
                    apps.get(0).getResume().getName(),
                    ids.size(),
                    rank(ids, analyses)
            ));
        });

        long total = byStatus.values().stream()
                .mapToLong(Long::longValue)
                .sum();

        return new DashboardResponse(
                total,
                byStatus,
                resumeStats,
                rank(allValidIds, analyses),
                missingByResume
        );
    }

    private Map<Long, AppAnalysis> analysisByApplication(
            Long userId, Collection<Long> applicationIds) {

        if (applicationIds.isEmpty()) {
            return Map.of();
        }

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(
                        Criteria.where("userId").is(userId)
                                .and("applicationId").in(applicationIds)
                                .and("resumeId").ne(null)
                ),
                Aggregation.unwind("missingKeywords", true),
                Aggregation.group("applicationId", "resumeId", "missingKeywords")
        );

        Map<Long, AppAnalysis> result = new HashMap<>();

        for (Document d : mongoTemplate.aggregate(
                agg, "job_descriptions", Document.class
        ).getMappedResults()) {

            Document id = d.get("_id", Document.class);

            if (id == null
                    || !(id.get("applicationId") instanceof Number appId)
                    || !(id.get("resumeId") instanceof Number resId)) {
                continue;
            }

            AppAnalysis analysis = result.computeIfAbsent(
                    appId.longValue(),
                    key -> new AppAnalysis(resId.longValue(), new HashSet<>())
            );

            String keyword = id.getString("missingKeywords");

            if (keyword != null && !keyword.isBlank()) {
                analysis.missing().add(keyword);
            }
        }

        return result;
    }

    private List<KeywordCount> rank(
            Collection<Long> appIds,
            Map<Long, AppAnalysis> analyses) {

        Map<String, Integer> counts = new HashMap<>();

        for (Long id : appIds) {
            AppAnalysis analysis = analyses.get(id);

            if (analysis != null) {
                analysis.missing().forEach(
                        keyword -> counts.merge(keyword, 1, Integer::sum)
                );
            }
        }

        return counts.entrySet().stream()
                .sorted(
                        Map.Entry.<String, Integer>comparingByValue()
                                .reversed()
                                .thenComparing(Map.Entry.comparingByKey())
                )
                .limit(10)
                .map(entry -> new KeywordCount(
                        entry.getKey(), entry.getValue()
                ))
                .toList();
    }
}