package com.nexus.job.controller;

import com.nexus.job.dto.JobDtos.*;
import com.nexus.job.service.JobCommandService;
import com.nexus.job.service.JobQueryService;
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
 * REST controller for Job management endpoints.
 */
@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Jobs", description = "Job listing management")
public class JobController {

    private final JobCommandService jobCommandService;
    private final JobQueryService jobQueryService;

    public JobController(JobCommandService jobCommandService, JobQueryService jobQueryService) {
        this.jobCommandService = jobCommandService;
        this.jobQueryService = jobQueryService;
    }

    /**
     * POST /api/jobs - Create a new job posting (RECRUITER only).
     */
    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Post a new job", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody CreateJobRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Name", defaultValue = "Recruiter") String userName) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobCommandService.createJob(request, userId, userName));
    }

    /**
     * GET /api/jobs - Get all active jobs.
     */
    @GetMapping
    @Operation(summary = "Get all active jobs")
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobQueryService.getAllJobs());
    }

    /**
     * GET /api/jobs/{id} - Get specific job details.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get job by ID")
    public ResponseEntity<JobResponse> getJobById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(jobQueryService.getJobById(id));
    }

    /**
     * GET /api/jobs/search - Search jobs with filters.
     */
    @GetMapping("/search")
    @Operation(summary = "Search jobs with filters")
    public ResponseEntity<List<JobResponse>> searchJobs(
            @RequestParam(name = "title", required = false) String title,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "jobType", required = false) String jobType,
            @RequestParam(name = "experience", required = false) String experience) {
        return ResponseEntity.ok(jobQueryService.searchJobs(title, location, jobType, experience));
    }

    /**
     * GET /api/jobs/recruiter/{recruiterId} - Get jobs posted by a recruiter.
     */
    @GetMapping("/recruiter/{recruiterId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get jobs by recruiter", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<JobResponse>> getRecruiterJobs(@PathVariable("recruiterId") Long recruiterId) {
        return ResponseEntity.ok(jobQueryService.getJobsByRecruiter(recruiterId));
    }

    /**
     * PUT /api/jobs/{id} - Update a job (RECRUITER only).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Update a job posting", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable("id") Long id,
            @RequestBody UpdateJobRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(jobCommandService.updateJob(id, request, userId));
    }

    /**
     * DELETE /api/jobs/{id} - Soft delete a job.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Delete a job posting", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse> deleteJob(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(jobCommandService.deleteJob(id, userId));
    }

    /**
     * GET /api/jobs/admin/all - Admin: get all jobs including inactive.
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: get all jobs", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<JobResponse>> getAllJobsAdmin() {
        return ResponseEntity.ok(jobQueryService.getAllJobsForAdmin());
    }
}
