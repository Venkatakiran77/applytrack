package com.applytrack.api.application;

import com.applytrack.api.application.dto.*;
import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.jd.JobDescriptionRepository;
import com.applytrack.api.user.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    private static final String OWNER = "owner@test.com";
    private static final String OTHER = "other@test.com";

    @Mock ApplicationRepository applicationRepository;
    @Mock UserRepository userRepository;
    @Mock JobDescriptionRepository jdRepository;

    @InjectMocks ApplicationService service;

    private JobApplication ownedApp(Long id, ApplicationStatus status) {
        return JobApplication.builder()
                .id(id).company("Acme").role("Dev").status(status)
                .user(User.builder().id(1L).email(OWNER).build())
                .build();
    }

    @Test
    void userCannotReadAnotherUsersApplication() {
        // the repository is only ever queried with the caller's email, so the other user gets nothing
        when(applicationRepository.findByIdAndUserEmail(5L, OTHER)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(OTHER, 5L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(applicationRepository, never()).findById(any());
    }

    @Test
    void userCannotDeleteAnotherUsersApplication() {
        when(applicationRepository.findByIdAndUserEmail(5L, OTHER)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(OTHER, 5L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(applicationRepository, never()).delete(any());
        verify(jdRepository, never()).deleteByApplicationId(any());
    }

    @Test
    void statusUpdateChangesTheEntityAndResponse() {
        JobApplication app = ownedApp(5L, ApplicationStatus.APPLIED);
        when(applicationRepository.findByIdAndUserEmail(5L, OWNER)).thenReturn(Optional.of(app));

        ApplicationResponse res = service.updateStatus(OWNER, 5L, new StatusUpdateRequest(ApplicationStatus.INTERVIEW));

        // persisted by JPA dirty checking when the @Transactional method commits
        assertThat(app.getStatus()).isEqualTo(ApplicationStatus.INTERVIEW);
        assertThat(res.status()).isEqualTo(ApplicationStatus.INTERVIEW);
    }

    @Test
    void createSavesApplicationAsAppliedForTheCurrentUser() {
        User user = User.builder().id(1L).email(OWNER).build();
        when(userRepository.findByEmail(OWNER)).thenReturn(Optional.of(user));
        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(inv -> inv.getArgument(0));

        ApplicationResponse res = service.create(OWNER,
                new ApplicationRequest("Acme", "Java Developer", null, "v1", null, null));

        ArgumentCaptor<JobApplication> captor = ArgumentCaptor.forClass(JobApplication.class);
        verify(applicationRepository).save(captor.capture());
        assertThat(captor.getValue().getUser()).isSameAs(user);
        assertThat(captor.getValue().getStatus()).isEqualTo(ApplicationStatus.APPLIED);
        assertThat(captor.getValue().getAppliedOn()).isNotNull(); // defaults to today
        assertThat(res.company()).isEqualTo("Acme");
    }

    @Test
    void deleteRemovesTheApplicationAndItsMongoDocument() {
        JobApplication app = ownedApp(5L, ApplicationStatus.APPLIED);
        when(applicationRepository.findByIdAndUserEmail(5L, OWNER)).thenReturn(Optional.of(app));

        service.delete(OWNER, 5L);

        verify(applicationRepository).delete(app);
        verify(jdRepository).deleteByApplicationId(5L);
    }

    @Test
    void listWithoutStatusDoesNotFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        when(applicationRepository.findByUserEmail(OWNER, pageable))
                .thenReturn(new PageImpl<>(List.of(ownedApp(1L, ApplicationStatus.APPLIED))));

        Page<ApplicationResponse> page = service.list(OWNER, null, pageable);

        assertThat(page.getContent()).hasSize(1);
        verify(applicationRepository, never()).findByUserEmailAndStatus(any(), any(), any());
    }

    @Test
    void listWithStatusFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        when(applicationRepository.findByUserEmailAndStatus(OWNER, ApplicationStatus.OFFER, pageable))
                .thenReturn(new PageImpl<>(List.of(ownedApp(2L, ApplicationStatus.OFFER))));

        Page<ApplicationResponse> page = service.list(OWNER, ApplicationStatus.OFFER, pageable);

        assertThat(page.getContent()).extracting(ApplicationResponse::status)
                .containsOnly(ApplicationStatus.OFFER);
    }
}