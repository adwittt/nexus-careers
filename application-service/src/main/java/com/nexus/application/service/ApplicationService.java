package com.nexus.application.service;

import com.nexus.application.dto.ApplicationDtos.*;
import com.nexus.application.entity.Application;
import com.nexus.application.entity.ApplicationStatus;
import com.nexus.application.exception.DuplicateApplicationException;
import com.nexus.application.exception.ResourceNotFoundException;
import com.nexus.application.exception.UnauthorizedException;
import com.nexus.application.repository.ApplicationRepository;
import com.nexus.application.client.JobServiceClient;
import com.nexus.application.client.JobDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Core business logic for job applications.
 * Enforces: one application per user per job,
 * and status flow: APPLIED → UNDER_REVIEW → SHORTLISTED/REJECTED
 */
@Service
@Transactional
public class ApplicationService {
    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);

    private final ApplicationRepository applicationRepository;
    private final JobServiceClient jobServiceClient;
    private final ApplicationMessageProducer messageProducer;

    public ApplicationService(ApplicationRepository applicationRepository, 
                              JobServiceClient jobServiceClient, 
                              ApplicationMessageProducer messageProducer) {
        this.applicationRepository = applicationRepository;
        this.jobServiceClient = jobServiceClient;
        this.messageProducer = messageProducer;
    }

    /**
     * Submit a job application.
     * Throws DuplicateApplicationException if user already applied.
     */
    public ApplicationResponse applyForJob(
            ApplyRequest request,
            Long userId,
            String applicantName,
            String applicantEmail) {

        JobDto jobDto = null;
        try {
            jobDto = jobServiceClient.getJobById(request.getJobId());
        } catch (Exception e) {
            throw new ResourceNotFoundException("Job not found or service unavailable: " + request.getJobId());
        }
        
        if (jobDto == null || !jobDto.isActive()) {
            throw new IllegalStateException("Job is no longer active or does not exist");
        }

        if (applicationRepository.existsByUserIdAndJobId(userId, request.getJobId())) {
            throw new DuplicateApplicationException(
                    "You have already applied for this job. Track your application in your dashboard.");
        }

        Application application = Application.builder()
                .userId(userId)
                .jobId(jobDto.getId())
                .applicantName(applicantName)
                .applicantEmail(applicantEmail)
                .jobTitle(jobDto.getTitle())
                .companyName(jobDto.getCompanyName())
                .resumeUrl(request.getResumeUrl())
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.APPLIED)
                .build();

        Application saved = applicationRepository.save(application);
        log.info("Application submitted: userId={} for jobId={}", userId, request.getJobId());
        
        String msg = String.format("New application submitted for Job '%s' by '%s' (Email: %s)", jobDto.getTitle(), applicantName, applicantEmail);
        messageProducer.sendApplicationEvent(msg);
        
        return mapToResponse(saved);
    }

    /**
     * Get all applications for the currently logged-in job seeker.
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getUserApplications(Long userId) {
        return applicationRepository.findByUserIdOrderByAppliedAtDesc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    /**
     * Get all applications for a specific job (Recruiter/Admin use).
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getJobApplications(Long jobId) {
        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId)
                .stream().map(this::mapToResponse).toList();
    }

    /**
     * Get a specific application by ID.
     */
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
        return mapToResponse(app);
    }

    /**
     * Update application status. Only RECRUITER or ADMIN can call this.
     * Enforces status transition rules.
     */
    public ApplicationResponse updateStatus(Long appId, UpdateStatusRequest request) {
        Application app = applicationRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + appId));

        ApplicationStatus newStatus;
        try {
            newStatus = ApplicationStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + request.getStatus()
                    + ". Valid values: APPLIED, UNDER_REVIEW, SHORTLISTED, REJECTED");
        }

        // Enforce transition rules
        validateStatusTransition(app.getStatus(), newStatus);

        app.setStatus(newStatus);
        if (request.getRecruiterNotes() != null) {
            app.setRecruiterNotes(request.getRecruiterNotes());
        }

        Application updated = applicationRepository.save(app);
        log.info("Application {} status updated: {} → {}", appId, app.getStatus(), newStatus);
        return mapToResponse(updated);
    }

    /**
     * Get status counts for admin reporting.
     */
    @Transactional(readOnly = true)
    public StatusCountResponse getStatusCounts() {
        StatusCountResponse counts = new StatusCountResponse();
        counts.setApplied(applicationRepository.countByStatus(ApplicationStatus.APPLIED));
        counts.setUnderReview(applicationRepository.countByStatus(ApplicationStatus.UNDER_REVIEW));
        counts.setShortlisted(applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED));
        counts.setRejected(applicationRepository.countByStatus(ApplicationStatus.REJECTED));
        counts.setTotal(applicationRepository.count());
        return counts;
    }

    /**
     * Withdraw an application. Only the applicant can withdraw.
     */
    public ApiResponse withdrawApplication(Long appId, Long userId) {
        Application app = applicationRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new UnauthorizedException("You can only withdraw your own applications");
        }

        if (app.getStatus() == ApplicationStatus.SHORTLISTED) {
            throw new IllegalStateException("Cannot withdraw a shortlisted application");
        }

        applicationRepository.delete(app);
        return new ApiResponse(true, "Application withdrawn successfully");
    }


    /**
     * Enforce valid status transitions:
     * APPLIED → UNDER_REVIEW → SHORTLISTED or REJECTED
     */
    private void validateStatusTransition(ApplicationStatus current, ApplicationStatus next) {
        boolean valid = switch (current) {
            case APPLIED -> next == ApplicationStatus.UNDER_REVIEW || next == ApplicationStatus.REJECTED;
            case UNDER_REVIEW -> next == ApplicationStatus.SHORTLISTED || next == ApplicationStatus.REJECTED;
            case SHORTLISTED -> next == ApplicationStatus.REJECTED;
            case REJECTED -> false; // Terminal state
        };

        if (!valid) {
            throw new IllegalStateException(
                    "Invalid status transition: " + current + " → " + next);
        }
    }

    private ApplicationResponse mapToResponse(Application app) {
        ApplicationResponse r = new ApplicationResponse();
        r.setId(app.getId());
        r.setUserId(app.getUserId());
        r.setJobId(app.getJobId());
        r.setApplicantName(app.getApplicantName());
        r.setApplicantEmail(app.getApplicantEmail());
        r.setJobTitle(app.getJobTitle());
        r.setCompanyName(app.getCompanyName());
        r.setResumeUrl(app.getResumeUrl());
        r.setCoverLetter(app.getCoverLetter());
        r.setStatus(app.getStatus().name());
        r.setRecruiterNotes(app.getRecruiterNotes());
        r.setAppliedAt(app.getAppliedAt() != null ? app.getAppliedAt().toString() : null);
        r.setUpdatedAt(app.getUpdatedAt() != null ? app.getUpdatedAt().toString() : null);
        return r;
    }
}
