package com.applytrack.api.jd;

import com.applytrack.api.application.*;
import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.jd.dto.*;
import com.applytrack.api.skills.*;
import com.applytrack.api.user.User;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    private static final String EMAIL = "me@test.com";
    private static final Long APP_ID = 1L;

    @Mock ApplicationRepository applicationRepository;
    @Mock SkillRepository skillRepository;
    @Mock JobDescriptionRepository jdRepository;

    private MatchService service;
    private JobApplication app;

    @BeforeEach
    void setUp() {
        KeywordExtractor extractor = new KeywordExtractor(List.of("java", "spring boot", "docker", "kafka"));
        service = new MatchService(applicationRepository, skillRepository, jdRepository, extractor);
        app = JobApplication.builder()
                .id(APP_ID)
                .user(User.builder().id(7L).email(EMAIL).build())
                .build();
    }

    private void ownedApplication() {
        when(applicationRepository.findByIdAndUserEmail(APP_ID, EMAIL)).thenReturn(Optional.of(app));
    }

    private void userHasSkills(String... names) {
        List<UserSkill> skills = Arrays.stream(names)
                .map(n -> UserSkill.builder().name(n).build()).toList();
        when(skillRepository.findByUserEmailOrderByNameAsc(EMAIL)).thenReturn(skills);
    }

    @Test
    void computesScoreAndMissingKeywords() {
        ownedApplication();
        userHasSkills("java", "spring boot");
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        MatchResponse res = service.match(EMAIL, APP_ID,
                new MatchRequest("Java, Spring Boot, Docker and Kafka required"));

        assertThat(res.matchScore()).isEqualTo(50.0);
        assertThat(res.matchedKeywords()).containsExactlyInAnyOrder("java", "spring boot");
        assertThat(res.missingKeywords()).containsExactlyInAnyOrder("docker", "kafka");
    }

    @Test
    void roundsScoreToOneDecimal() {
        ownedApplication();
        userHasSkills("java");
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        MatchResponse res = service.match(EMAIL, APP_ID,
                new MatchRequest("Java, Docker and Kafka"));

        assertThat(res.matchScore()).isEqualTo(33.3);
    }

    @Test
    void emptySkillListGivesZeroAndEverythingMissing() {
        ownedApplication();
        userHasSkills();
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        MatchResponse res = service.match(EMAIL, APP_ID, new MatchRequest("Java and Docker"));

        assertThat(res.matchScore()).isZero();
        assertThat(res.matchedKeywords()).isEmpty();
        assertThat(res.missingKeywords()).containsExactlyInAnyOrder("java", "docker");
    }

    @Test
    void jobDescriptionWithNoKnownKeywordsGivesZeroWithoutError() {
        ownedApplication();
        userHasSkills("java");
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        MatchResponse res = service.match(EMAIL, APP_ID, new MatchRequest("Great team, great culture"));

        assertThat(res.matchScore()).isZero();
        assertThat(res.extractedKeywords()).isEmpty();
    }

    @Test
    void persistsResultToMongoForTheOwner() {
        ownedApplication();
        userHasSkills("java");
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        service.match(EMAIL, APP_ID, new MatchRequest("Java and Docker"));

        ArgumentCaptor<JobDescriptionDoc> captor = ArgumentCaptor.forClass(JobDescriptionDoc.class);
        verify(jdRepository).save(captor.capture());
        JobDescriptionDoc saved = captor.getValue();
        assertThat(saved.getApplicationId()).isEqualTo(APP_ID);
        assertThat(saved.getUserId()).isEqualTo(7L);
        assertThat(saved.getMissingKeywords()).containsExactly("docker");
        assertThat(saved.getMatchScore()).isEqualTo(50.0);
    }

    @Test
    void reanalysingOverwritesTheExistingDocument() {
        ownedApplication();
        userHasSkills("java");
        JobDescriptionDoc existing = JobDescriptionDoc.builder().id("abc").applicationId(APP_ID).build();
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.of(existing));

        service.match(EMAIL, APP_ID, new MatchRequest("Java"));

        ArgumentCaptor<JobDescriptionDoc> captor = ArgumentCaptor.forClass(JobDescriptionDoc.class);
        verify(jdRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo("abc");
    }

    @Test
    void rejectsApplicationsOwnedBySomeoneElse() {
        when(applicationRepository.findByIdAndUserEmail(APP_ID, EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.match(EMAIL, APP_ID, new MatchRequest("Java")))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(jdRepository, never()).save(any());
        verifyNoInteractions(skillRepository);
    }

    @Test
    void latestReturnsTheStoredAnalysis() {
        ownedApplication();
        JobDescriptionDoc doc = JobDescriptionDoc.builder()
                .applicationId(APP_ID).matchScore(50.0)
                .extractedKeywords(List.of("java", "docker"))
                .matchedKeywords(List.of("java"))
                .missingKeywords(List.of("docker")).build();
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.of(doc));

        MatchResponse res = service.latest(EMAIL, APP_ID);

        assertThat(res.matchScore()).isEqualTo(50.0);
        assertThat(res.missingKeywords()).containsExactly("docker");
    }

    @Test
    void latestThrowsWhenNothingAnalysedYet() {
        ownedApplication();
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.latest(EMAIL, APP_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}