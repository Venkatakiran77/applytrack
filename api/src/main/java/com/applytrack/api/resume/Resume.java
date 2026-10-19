package com.applytrack.api.resume;

import com.applytrack.api.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "resumes", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "name"}))
@Getter
@Setter
@NoArgsConstructor
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @Column(nullable = false, length = 60)
    private String name;

    private String fileName;
    private String contentType;
    private long sizeBytes;
    private String fileId;
    private Instant uploadedAt = Instant.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resume_keywords", joinColumns = @JoinColumn(name = "resume_id"))
    @Column(name = "keyword")
    private Set<String> keywords = new HashSet<>();
}