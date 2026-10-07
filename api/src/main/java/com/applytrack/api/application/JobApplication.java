package com.applytrack.api.application;

import com.applytrack.api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "job_applications", indexes = {
        @Index(name = "idx_app_user_status", columnList = "user_id, status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String role;

    private String jobUrl;
    private String resumeVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    private LocalDate appliedOn;

    @Column(nullable = false)
    private Instant lastUpdated;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist @PreUpdate
    void touch() {
        lastUpdated = Instant.now();
    }
}