package com.applytrack.api.application;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<JobApplication, Long> {

    Page<JobApplication> findByUserEmail(String email, Pageable pageable);

    Page<JobApplication> findByUserEmailAndStatus(String email, ApplicationStatus status, Pageable pageable);

    Optional<JobApplication> findByIdAndUserEmail(Long id, String email);
}