package com.applytrack.api.jd;

import com.applytrack.api.jd.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications/{id}/match")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    public MatchResponse match(@AuthenticationPrincipal UserDetails principal,
                               @PathVariable Long id,
                               @Valid @RequestBody MatchRequest req) {
        return matchService.match(principal.getUsername(), id, req);
    }
}