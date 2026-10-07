package com.applytrack.api.jd;

import com.applytrack.api.application.*;
import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.jd.dto.*;
import com.applytrack.api.skills.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final ApplicationRepository applicationRepository;
    private final SkillRepository skillRepository;
    private final JobDescriptionRepository jdRepository;
    private final KeywordExtractor keywordExtractor;

    @Transactional
    public MatchResponse match(String email, Long applicationId, MatchRequest req) {
        // scoping: throws 404 if this application is not the caller's
        JobApplication app = applicationRepository.findByIdAndUserEmail(applicationId, email)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        Set<String> extracted = keywordExtractor.extract(req.jdText());
        Set<String> skills = skillRepository.findByUserEmailOrderByNameAsc(email).stream()
                .map(UserSkill::getName)
                .collect(Collectors.toSet());

        List<String> matched = extracted.stream().filter(skills::contains).toList();
        List<String> missing = extracted.stream().filter(k -> !skills.contains(k)).toList();

        double score = extracted.isEmpty()
                ? 0.0
                : Math.round(matched.size() * 1000.0 / extracted.size()) / 10.0; // one decimal

        // one document per application: re-analysing overwrites the previous result
        JobDescriptionDoc doc = jdRepository.findByApplicationId(applicationId)
                .orElseGet(JobDescriptionDoc::new);
        doc.setApplicationId(applicationId);
        doc.setUserId(app.getUser().getId());
        doc.setRawText(req.jdText());
        doc.setExtractedKeywords(List.copyOf(extracted));
        doc.setMatchedKeywords(matched);
        doc.setMissingKeywords(missing);
        doc.setMatchScore(score);
        doc.setAnalyzedAt(Instant.now());
        jdRepository.save(doc);

        return new MatchResponse(applicationId, score, List.copyOf(extracted), matched, missing);
    }
}