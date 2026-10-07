package com.applytrack.api.skills;

import com.applytrack.api.common.ResourceNotFoundException;
import com.applytrack.api.skills.dto.*;
import com.applytrack.api.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SkillResponse> list(String email) {
        return skillRepository.findByUserEmailOrderByNameAsc(email).stream()
                .map(s -> new SkillResponse(s.getId(), s.getName()))
                .toList();
    }

    public SkillResponse add(String email, SkillRequest req) {
        String name = req.name().trim().toLowerCase(Locale.ROOT);
        if (skillRepository.existsByUserEmailAndName(email, name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Skill already added");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserSkill saved = skillRepository.save(UserSkill.builder().user(user).name(name).build());
        return new SkillResponse(saved.getId(), saved.getName());
    }

    public void delete(String email, Long id) {
        UserSkill skill = skillRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
        skillRepository.delete(skill);
    }
}