package com.nexus.application.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Application entity — represents a job seeker's application for a job.
 * Unique constraint prevents duplicate applications per user per job.
 */
@Entity
@Table(
    name = "applications",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_user_job",
        columnNames = {"user_id", "job_id"}
    )
)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "applicant_name")
    private String applicantName;

    @Column(name = "applicant_email")
    private String applicantEmail;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "recruiter_notes")
    private String recruiterNotes;

    @CreationTimestamp
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Application() {}

    public Application(Long id, Long userId, Long jobId, String applicantName, String applicantEmail, String jobTitle, String companyName, String resumeUrl, String coverLetter, ApplicationStatus status, String recruiterNotes, LocalDateTime appliedAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.jobId = jobId;
        this.applicantName = applicantName;
        this.applicantEmail = applicantEmail;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.resumeUrl = resumeUrl;
        this.coverLetter = coverLetter;
        this.status = status;
        this.recruiterNotes = recruiterNotes;
        this.appliedAt = appliedAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public String getRecruiterNotes() { return recruiterNotes; }
    public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ApplicationBuilder builder() {
        return new ApplicationBuilder();
    }

    public static class ApplicationBuilder {
        private Long id;
        private Long userId;
        private Long jobId;
        private String applicantName;
        private String applicantEmail;
        private String jobTitle;
        private String companyName;
        private String resumeUrl;
        private String coverLetter;
        private ApplicationStatus status = ApplicationStatus.APPLIED;
        private String recruiterNotes;
        private LocalDateTime appliedAt;
        private LocalDateTime updatedAt;

        public ApplicationBuilder id(Long id) { this.id = id; return this; }
        public ApplicationBuilder userId(Long userId) { this.userId = userId; return this; }
        public ApplicationBuilder jobId(Long jobId) { this.jobId = jobId; return this; }
        public ApplicationBuilder applicantName(String applicantName) { this.applicantName = applicantName; return this; }
        public ApplicationBuilder applicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; return this; }
        public ApplicationBuilder jobTitle(String jobTitle) { this.jobTitle = jobTitle; return this; }
        public ApplicationBuilder companyName(String companyName) { this.companyName = companyName; return this; }
        public ApplicationBuilder resumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; return this; }
        public ApplicationBuilder coverLetter(String coverLetter) { this.coverLetter = coverLetter; return this; }
        public ApplicationBuilder status(ApplicationStatus status) { this.status = status; return this; }
        public ApplicationBuilder recruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; return this; }
        public ApplicationBuilder appliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; return this; }
        public ApplicationBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Application build() {
            return new Application(id, userId, jobId, applicantName, applicantEmail, jobTitle, companyName, resumeUrl, coverLetter, status, recruiterNotes, appliedAt, updatedAt);
        }
    }
}
