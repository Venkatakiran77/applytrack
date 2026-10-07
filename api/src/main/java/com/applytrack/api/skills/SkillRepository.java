package com.applytrack.api.skills;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface SkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findByUserEmailOrderByNameAsc(String email);
    boolean existsByUserEmailAndName(String email, String name);
    Optional<UserSkill> findByIdAndUserEmail(Long id, String email);
}