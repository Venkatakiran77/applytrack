package com.applytrack.api.jd;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Component
public class KeywordExtractor {

    private final Map<String, Pattern> patterns = new LinkedHashMap<>();

    @Autowired
    public KeywordExtractor() {
        this(loadDefault());
    }

    // Used by unit tests with a small custom vocabulary.
    KeywordExtractor(Collection<String> keywords) {
        for (String kw : keywords) {
            String k = kw.trim().toLowerCase(Locale.ROOT);
            if (k.isEmpty()) continue;
            // "java" must not match inside "javascript": no letter or digit directly before or after.
            patterns.put(k, Pattern.compile("(?<![a-z0-9])" + Pattern.quote(k) + "(?![a-z0-9])"));
        }
    }

    public Set<String> extract(String text) {
        Set<String> found = new LinkedHashSet<>();
        if (text == null || text.isBlank()) return found;
        String normalized = text.toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
        patterns.forEach((kw, p) -> {
            if (p.matcher(normalized).find()) found.add(kw);
        });
        return found;
    }

    private static List<String> loadDefault() {
        try (var reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource("keywords.txt").getInputStream(), StandardCharsets.UTF_8))) {
            return reader.lines()
                    .map(String::trim)
                    .filter(l -> !l.isEmpty() && !l.startsWith("#"))
                    .toList();
        } catch (IOException e) {
            throw new UncheckedIOException("Could not load keywords.txt", e);
        }
    }
}