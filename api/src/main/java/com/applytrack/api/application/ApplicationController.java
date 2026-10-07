package com.applytrack.api.application;

import com.applytrack.api.application.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService service;

    @GetMapping
    public Page<ApplicationResponse> list(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 10, sort = "appliedOn", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.list(principal.getUsername(), status, pageable);
    }

    @GetMapping("/{id}")
    public ApplicationResponse get(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
        return service.get(principal.getUsername(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse create(@AuthenticationPrincipal UserDetails principal,
                                      @Valid @RequestBody ApplicationRequest req) {
        return service.create(principal.getUsername(), req);
    }

    @PutMapping("/{id}")
    public ApplicationResponse update(@AuthenticationPrincipal UserDetails principal,
                                      @PathVariable Long id,
                                      @Valid @RequestBody ApplicationRequest req) {
        return service.update(principal.getUsername(), id, req);
    }

    @PatchMapping("/{id}/status")
    public ApplicationResponse updateStatus(@AuthenticationPrincipal UserDetails principal,
                                            @PathVariable Long id,
                                            @Valid @RequestBody StatusUpdateRequest req) {
        return service.updateStatus(principal.getUsername(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
        service.delete(principal.getUsername(), id);
    }
}