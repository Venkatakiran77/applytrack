package com.applytrack.api.skills;

import com.applytrack.api.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_skills",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String name; // stored lowercase, e.g. "spring boot"
}