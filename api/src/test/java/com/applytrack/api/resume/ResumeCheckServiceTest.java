package com.applytrack.api.resume;

import com.applytrack.api.jd.KeywordExtractor;
import com.applytrack.api.jd.dto.MatchResponse;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import static org.assertj.core.api.Assertions.*;

public class ResumeCheckServiceTest {
    private final ResumeCheckService service =
            new ResumeCheckService(new KeywordExtractor());

@Test
void splitsMatchedAndMissingAgainstResumeKeywords() {
    Resume r = new Resume();
    r.setName("FE");
    r.setKeywords(new HashSet<>(Set.of("java")));

    MatchResponse res = service.check(r, "Java, Docker and Kafka");

    assertThat(res.score()).isEqualTo(33.3);
    assertThat(res.matchedKeywords()).containsExactly("java");
    assertThat(res.missingKeywords()).containsExactly("docker", "kafka");
}

@Test
void resumeWithoutKeywordsSaysSo() {
    Resume r = new Resume();
    r.setName("Old");
    assertThat(service.check(r, "Java").basis()).contains("no detected skills");
}
}
