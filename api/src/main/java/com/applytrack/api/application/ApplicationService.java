package com.applytrack.api.application;

import com.applytrack.api.application.dto.*;
import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.jd.JobDescriptionRepository;
import com.applytrack.api.resume.Resume;
import com.applytrack.api.resume.ResumeService;
import com.applytrack.api.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobDescriptionRepository jdRepository;
    private final ResumeService resumeService; // <-- Inject ResumeService here

    public ApplicationResponse create(String email, ApplicationRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        JobApplication app = JobApplication.builder()
                .user(user)
                .status(ApplicationStatus.APPLIED)
                .build();
        apply(user, app, req); // Pass user to fetch the resume properly
        return ApplicationResponse.from(applicationRepository.save(app));
    }

    @Transactional(readOnly = true)
    public Page<ApplicationResponse> list(String email, ApplicationStatus status, Pageable pageable) {
        Page<JobApplication> page = (status == null)
                ? applicationRepository.findByUserEmail(email, pageable)
                : applicationRepository.findByUserEmailAndStatus(email, status, pageable);
        return page.map(ApplicationResponse::from);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse get(String email, Long id) {
        return ApplicationResponse.from(findOwned(email, id));
    }

    public ApplicationResponse update(String email, Long id, ApplicationRequest req) {
        JobApplication app = findOwned(email, id);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        apply(user, app, req);
        return ApplicationResponse.from(app);
    }

    public ApplicationResponse updateStatus(String email, Long id, StatusUpdateRequest req) {
        JobApplication app = findOwned(email, id);
        app.setStatus(req.status());
        return ApplicationResponse.from(app);
    }

    // Other users' records are reported as 404, not 403, so ids can't be probed.
    private JobApplication findOwned(String email, Long id) {
        return applicationRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    }

    private void apply(User user, JobApplication app, ApplicationRequest req) {
        app.setCompany(req.company().trim());
        app.setRole(req.role().trim());
        app.setJobUrl(req.jobUrl());

        // Fetch resume using resumeId if provided, then set relationship and name version
        Resume resume = req.resumeId() == null ? null : resumeService.getOwned(user, req.resumeId());
        app.setResume(resume);
        app.setResumeVersion(resume != null ? resume.getName() : null);

        app.setAppliedOn(req.appliedOn() != null ? req.appliedOn() : LocalDate.now());
        app.setNotes(req.notes());
    }

    public void delete(String email, Long id) {
        applicationRepository.delete(findOwned(email, id));
        jdRepository.deleteByApplicationId(id);
    }
}