package com.applytrack.api.jd;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class KeywordExtractorTest {

    private final KeywordExtractor extractor = new KeywordExtractor(
            List.of("java", "javascript", "spring boot", "react", "docker", "c++", "node.js"));

    @Test
    void extractsKnownKeywordsFromJobDescription() {
        String jd = "We need a Java engineer with Spring Boot, React and Docker experience.";

        assertThat(extractor.extract(jd))
                .containsExactlyInAnyOrder("java", "spring boot", "react", "docker");
    }

    @Test
    void ignoresFillerWords() {
        String jd = "We are looking for a motivated team player with excellent communication skills.";

        assertThat(extractor.extract(jd)).isEmpty();
    }

    @Test
    void javaDoesNotMatchInsideJavaScript() {
        assertThat(extractor.extract("Strong JavaScript skills required"))
                .containsExactly("javascript");
    }

    @Test
    void isCaseInsensitiveAndIgnoresLineBreaksInsidePhrases() {
        assertThat(extractor.extract("SPRING\nBoot and DOCKER"))
                .containsExactlyInAnyOrder("spring boot", "docker");
    }

    @Test
    void handlesKeywordsWithSpecialCharacters() {
        assertThat(extractor.extract("Experience with C++ and Node.js, preferably both."))
                .containsExactlyInAnyOrder("c++", "node.js");
    }

    @Test
    void returnsEmptyForNullOrBlankText() {
        assertThat(extractor.extract(null)).isEmpty();
        assertThat(extractor.extract("   ")).isEmpty();
    }
}