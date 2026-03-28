package com.nexus.application.controller;

import com.nexus.application.dto.ApplicationDtos.*;
import com.nexus.application.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for job application endpoints.
 * Headers X-User-Id, X-User-Name, X-User-Email injected by API Gateway.
 */
@RestController
@RequestMapping("/api/applications")
@Tag(name = "Applications", description = "Submit and manage job applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * Submit a new job application.
     * Role: JOB_SEEKER only.
     */
    @PostMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    @Operation(summary = "Apply for a job", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApplicationResponse> applyForJob(
            @Valid @RequestBody ApplyRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(name = "X-User-Name", defaultValue = "Unknown") String userName,
            @RequestHeader(name = "X-User-Email", defaultValue = "") String userEmail) {

        ApplicationResponse response = applicationService.applyForJob(request, userId, userName, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get current user's applications.
     * Role: JOB_SEEKER.
     */
    @GetMapping("/user")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    @Operation(summary = "Get my applications", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(applicationService.getUserApplications(userId));
    }

    /**
     * Get all applications for a job (Recruiter/Admin).
     */
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Get applications for a job", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<ApplicationResponse>> getJobApplications(@PathVariable("jobId") Long jobId) {
        return ResponseEntity.ok(applicationService.getJobApplications(jobId));
    }

    /**
     * Get a specific application by ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get application by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApplicationResponse> getApplication(@PathVariable("id") Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    /**
     * Update application status (Recruiter/Admin only).
     * Status flow: APPLIED → UNDER_REVIEW → SHORTLISTED or REJECTED
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Update application status", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(applicationService.updateStatus(id, request));
    }

    /**
     * Withdraw an application (Job Seeker only).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    @Operation(summary = "Withdraw application", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse> withdrawApplication(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(applicationService.withdrawApplication(id, userId));
    }

    /**
     * Get application status counts (Admin).
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get application stats", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<StatusCountResponse> getStats() {
        return ResponseEntity.ok(applicationService.getStatusCounts());
    }
}
