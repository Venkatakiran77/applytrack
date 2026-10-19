package com.applytrack.api.resume;

import com.applytrack.api.jd.KeywordExtractor;
import com.applytrack.api.jd.dto.MatchResponse;
// import KeywordExtractor from wherever MatchService gets it (jd or skills package)
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeCheckService {

    private final KeywordExtractor keywordExtractor;

    public MatchResponse check(Resume resume, String jdText) {
        Set<String> have = resume.getKeywords() == null ? Set.of() : resume.getKeywords();
        Set<String> extracted = keywordExtractor.extract(jdText);

        Set<String> matched = extracted.stream().filter(have::contains)
                .collect(Collectors.toCollection(TreeSet::new));
        Set<String> missing = extracted.stream().filter(k -> !have.contains(k))
                .collect(Collectors.toCollection(TreeSet::new));
        double score = extracted.isEmpty() ? 0.0
                : Math.round(matched.size() * 1000.0 / extracted.size()) / 10.0;

        String basis = have.isEmpty()
                ? "Resume \"" + resume.getName() + "\" has no detected skills (re-upload it)"
                : "Resume: " + resume.getName();

        return new MatchResponse(null, score, List.copyOf(extracted),
                new ArrayList<>(matched), new ArrayList<>(missing), basis);
    }
}