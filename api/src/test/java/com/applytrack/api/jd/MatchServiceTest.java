package com.applytrack.api.jd;

import com.applytrack.api.application.*;
import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.jd.dto.*;
import com.applytrack.api.resume.Resume;
import com.applytrack.api.skills.*;
import com.applytrack.api.user.User;
import com.applytrack.api.user.UserRepository;
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
    @Mock
    UserRepository userRepository;

    private MatchService service;
    private JobApplication app;

    @BeforeEach
    void setUp() {
        KeywordExtractor extractor = new KeywordExtractor(List.of("java", "spring boot", "docker", "kafka"));
        service = new MatchService(
                applicationRepository,
                skillRepository,
                jdRepository,
                extractor,
                userRepository
        );

        app = JobApplication.builder()
                .id(APP_ID)
                .user(User.builder().id(7L).email(EMAIL).build())
                .build();

    }

    private void userExists() {
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.of(User.builder().id(7L).email(EMAIL).build()));
    }

    private void ownedApplication() {   // application only, no userExists() here
        when(applicationRepository.findByIdAndUserEmail(APP_ID, EMAIL)).thenReturn(Optional.of(app));
    }

    private void userAndApplication() {               // used by match()
        userExists();
        ownedApplication();
    }
    private void userHasSkills(String... names) {
        List<UserSkill> skills = Arrays.stream(names)
                .map(n -> UserSkill.builder().name(n).build()).toList();
        when(skillRepository.findByUserEmailOrderByNameAsc(EMAIL)).thenReturn(skills);
    }

    @Test
    void computesScoreAndMissingKeywords() {
        userAndApplication();
        userHasSkills("java", "spring boot");
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        MatchResponse res = service.match(EMAIL, APP_ID,
                new MatchRequest("Java, Spring Boot, Docker and Kafka required"));

        assertThat(res.score()).isEqualTo(50.0);
        assertThat(res.matchedKeywords()).containsExactlyInAnyOrder("java", "spring boot");
        assertThat(res.missingKeywords()).containsExactlyInAnyOrder("docker", "kafka");
    }

    @Test
    void roundsScoreToOneDecimal() {
        userAndApplication();
        userHasSkills("java");
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        MatchResponse res = service.match(EMAIL, APP_ID,
                new MatchRequest("Java, Docker and Kafka"));

        assertThat(res.score()).isEqualTo(33.3);
    }

    @Test
    void emptySkillListGivesZeroAndEverythingMissing() {
        userAndApplication();
        userHasSkills();
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        MatchResponse res = service.match(EMAIL, APP_ID, new MatchRequest("Java and Docker"));

        assertThat(res.score()).isZero();
        assertThat(res.matchedKeywords()).isEmpty();
        assertThat(res.missingKeywords()).containsExactlyInAnyOrder("java", "docker");
    }

    @Test
    void jobDescriptionWithNoKnownKeywordsGivesZeroWithoutError() {
        userAndApplication();
        userHasSkills("java");
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        MatchResponse res = service.match(EMAIL, APP_ID, new MatchRequest("Great team, great culture"));

        assertThat(res.score()).isZero();
        assertThat(res.extractedKeywords()).isEmpty();
    }

    @Test
    void persistsResultToMongoForTheOwner() {
        userAndApplication();
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
        userAndApplication();
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
        userExists();
        when(applicationRepository.findByIdAndUserEmail(APP_ID, EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.match(EMAIL, APP_ID, new MatchRequest("Java")))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Application not found");

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

        assertThat(res.score()).isEqualTo(50.0);
        assertThat(res.missingKeywords()).containsExactly("docker");
    }

    @Test
    void latestThrowsWhenNothingAnalysedYet() {
        ownedApplication();
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.latest(EMAIL, APP_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void savesResumeIdWhenLinkedResumeHasKeywords() {
        userAndApplication();
        Resume resume = new Resume();
        resume.setId(10L);
        resume.setName("FE");
        resume.setKeywords(new HashSet<>(Set.of("java")));
        app.setResume(resume);
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        service.match(EMAIL, APP_ID, new MatchRequest("Java and Docker"));

        ArgumentCaptor<JobDescriptionDoc> captor = ArgumentCaptor.forClass(JobDescriptionDoc.class);
        verify(jdRepository).save(captor.capture());
        assertThat(captor.getValue().getResumeId()).isEqualTo(10L);
        assertThat(captor.getValue().getMissingKeywords()).containsExactly("docker");
        verifyNoInteractions(skillRepository);   // resume keywords used, not the Skills list
    }

    @Test
    void leavesResumeIdNullWhenResumeHasNoKeywords() {
        userAndApplication();
        userHasSkills("java");
        Resume resume = new Resume();
        resume.setId(10L);
        resume.setName("FE");                      // keywords empty -> falls back to Skills list
        app.setResume(resume);
        when(jdRepository.findByApplicationId(APP_ID)).thenReturn(Optional.empty());

        service.match(EMAIL, APP_ID, new MatchRequest("Java and Docker"));

        ArgumentCaptor<JobDescriptionDoc> captor = ArgumentCaptor.forClass(JobDescriptionDoc.class);
        verify(jdRepository).save(captor.capture());
        assertThat(captor.getValue().getResumeId()).isNull();
    }

}