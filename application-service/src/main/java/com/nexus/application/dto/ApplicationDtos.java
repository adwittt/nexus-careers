package com.nexus.application.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTOs for the Application Service.
 */
public class ApplicationDtos {


    public static class ApplyRequest {
        @NotNull(message = "Job ID is required")
        private Long jobId;

        private String jobTitle;
        private String companyName;
        private String resumeUrl;
        private String coverLetter;

        public ApplyRequest() {}

        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }
        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getResumeUrl() { return resumeUrl; }
        public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
        public String getCoverLetter() { return coverLetter; }
        public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    }

    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private String status;   // APPLIED | UNDER_REVIEW | SHORTLISTED | REJECTED

        private String recruiterNotes;

        public UpdateStatusRequest() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRecruiterNotes() { return recruiterNotes; }
        public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }
    }


    public static class ApplicationResponse {
        private Long id;
        private Long userId;
        private Long jobId;
        private String applicantName;
        private String applicantEmail;
        private String jobTitle;
        private String companyName;
        private String resumeUrl;
        private String coverLetter;
        private String status;
        private String recruiterNotes;
        private String appliedAt;
        private String updatedAt;

        public ApplicationResponse() {}

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
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRecruiterNotes() { return recruiterNotes; }
        public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }
        public String getAppliedAt() { return appliedAt; }
        public void setAppliedAt(String appliedAt) { this.appliedAt = appliedAt; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class ApiResponse {
        private boolean success;
        private String message;

        public ApiResponse() {}
        public ApiResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class StatusCountResponse {
        private long applied;
        private long underReview;
        private long shortlisted;
        private long rejected;
        private long total;

        public StatusCountResponse() {}

        public long getApplied() { return applied; }
        public void setApplied(long applied) { this.applied = applied; }
        public long getUnderReview() { return underReview; }
        public void setUnderReview(long underReview) { this.underReview = underReview; }
        public long getShortlisted() { return shortlisted; }
        public void setShortlisted(long shortlisted) { this.shortlisted = shortlisted; }
        public long getRejected() { return rejected; }
        public void setRejected(long rejected) { this.rejected = rejected; }
        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
    }
}
