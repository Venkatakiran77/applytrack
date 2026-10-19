package com.applytrack.api.dashboard;

import com.applytrack.api.application.*;
import com.applytrack.api.dashboard.dto.*;
import com.applytrack.api.resume.Resume;
import com.applytrack.api.user.User;
import com.applytrack.api.user.UserRepository;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    ApplicationRepository applicationRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    MongoTemplate mongoTemplate;

    private DashboardService service;

    @BeforeEach
    void setUp() {
        service = new DashboardService(
                applicationRepository,
                userRepository,
                mongoTemplate
        );
    }

    @Test
    void missingSkillsAreSeparatedPerResume() {
        User user = User.builder()
                .id(7L)
                .email("a@b.com")
                .build();

        Resume frontend = new Resume();
        frontend.setId(10L);
        frontend.setName("Frontend Resume");
        frontend.setUser(user);

        Resume backend = new Resume();
        backend.setId(20L);
        backend.setName("Backend Resume");
        backend.setUser(user);

        JobApplication app1 = application(1L, user, frontend);
        JobApplication app2 = application(2L, user, frontend);
        JobApplication app3 = application(3L, user, backend);

        when(userRepository.findByEmail("a@b.com"))
                .thenReturn(Optional.of(user));

        Page<JobApplication> page = new PageImpl<>(
                List.of(app1, app2, app3)
        );

        when(applicationRepository.findByUserEmail(
                eq("a@b.com"), any()
        )).thenReturn(page);

        when(applicationRepository.resumeStats(eq(user), anyList()))
                .thenReturn(List.of());

        List<Document> rows = List.of(
                row(1L, 10L, "docker"),
                row(1L, 10L, "css"),
                row(2L, 10L, "docker"),
                row(3L, 20L, "kafka")
        );

        when(mongoTemplate.aggregate(
                any(Aggregation.class),
                eq("job_descriptions"),
                eq(Document.class)
        )).thenReturn(new AggregationResults<>(rows, new Document()));

        DashboardResponse response = service.summary("a@b.com");

        assertThat(response.missingByResume()).hasSize(2);

        ResumeMissingSkills fe = response.missingByResume().get(0);
        assertThat(fe.resumeId()).isEqualTo(10L);
        assertThat(fe.applicationsAnalyzed()).isEqualTo(2);
        assertThat(fe.skills())
                .extracting(KeywordCount::keyword)
                .containsExactly("docker", "css");

        ResumeMissingSkills be = response.missingByResume().get(1);
        assertThat(be.resumeId()).isEqualTo(20L);
        assertThat(be.applicationsAnalyzed()).isEqualTo(1);
        assertThat(be.skills())
                .extracting(KeywordCount::keyword)
                .containsExactly("kafka");
    }

    private static JobApplication application(
            Long id, User user, Resume resume) {
        return JobApplication.builder()
                .id(id)
                .user(user)
                .company("Test Company")
                .role("Software Engineer")
                .status(ApplicationStatus.APPLIED)
                .resume(resume)
                .build();
    }

    private static Document row(Long appId, Long resumeId, String keyword) {
        return new Document(
                "_id",
                new Document("applicationId", appId)
                        .append("resumeId", resumeId)
                        .append("missingKeywords", keyword)
        );
    }
}