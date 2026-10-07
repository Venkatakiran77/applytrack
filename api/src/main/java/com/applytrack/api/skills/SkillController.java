package com.applytrack.api.skills;

import com.applytrack.api.skills.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService service;

    @GetMapping
    public List<SkillResponse> list(@AuthenticationPrincipal UserDetails p) {
        return service.list(p.getUsername());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SkillResponse add(@AuthenticationPrincipal UserDetails p, @Valid @RequestBody SkillRequest req) {
        return service.add(p.getUsername(), req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserDetails p, @PathVariable Long id) {
        service.delete(p.getUsername(), id);
    }
}