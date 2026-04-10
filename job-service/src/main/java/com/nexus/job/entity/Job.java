package com.nexus.job.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Job entity representing a job posting on the portal.
 */
@Entity
@Table(name = "jobs")
public class Job implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Job title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Company name is required")
    @Column(name = "company_name", nullable = false)
    private String companyName;

    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;

    private String salary;
    private String experience;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> requiredSkills = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false)
    private JobType jobType = JobType.FULL_TIME;

    @Column(name = "posted_by")
    private Long postedBy;

    @Column(name = "recruiter_name")
    private String recruiterName;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "application_deadline")
    private LocalDateTime applicationDeadline;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Job() {}

    public Job(Long id, String title, String companyName, String location, String salary, String experience, 
               String description, List<String> requiredSkills, JobType jobType, Long postedBy, 
               String recruiterName, boolean isActive, LocalDateTime applicationDeadline, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.companyName = companyName;
        this.location = location;
        this.salary = salary;
        this.experience = experience;
        this.description = description;
        this.requiredSkills = requiredSkills != null ? requiredSkills : new ArrayList<>();
        this.jobType = jobType != null ? jobType : JobType.FULL_TIME;
        this.postedBy = postedBy;
        this.recruiterName = recruiterName;
        this.isActive = isActive;
        this.applicationDeadline = applicationDeadline;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }
    public JobType getJobType() { return jobType; }
    public void setJobType(JobType jobType) { this.jobType = jobType; }
    public Long getPostedBy() { return postedBy; }
    public void setPostedBy(Long postedBy) { this.postedBy = postedBy; }
    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { this.isActive = active; }
    public LocalDateTime getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDateTime applicationDeadline) { this.applicationDeadline = applicationDeadline; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static JobBuilder builder() {
        return new JobBuilder();
    }

    public static class JobBuilder {
        private Long id;
        private String title;
        private String companyName;
        private String location;
        private String salary;
        private String experience;
        private String description;
        private List<String> requiredSkills;
        private JobType jobType;
        private Long postedBy;
        private String recruiterName;
        private boolean isActive = true;
        private LocalDateTime applicationDeadline;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public JobBuilder id(Long id) { this.id = id; return this; }
        public JobBuilder title(String title) { this.title = title; return this; }
        public JobBuilder companyName(String companyName) { this.companyName = companyName; return this; }
        public JobBuilder location(String location) { this.location = location; return this; }
        public JobBuilder salary(String salary) { this.salary = salary; return this; }
        public JobBuilder experience(String experience) { this.experience = experience; return this; }
        public JobBuilder description(String description) { this.description = description; return this; }
        public JobBuilder requiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; return this; }
        public JobBuilder jobType(JobType jobType) { this.jobType = jobType; return this; }
        public JobBuilder postedBy(Long postedBy) { this.postedBy = postedBy; return this; }
        public JobBuilder recruiterName(String recruiterName) { this.recruiterName = recruiterName; return this; }
        public JobBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
        public JobBuilder applicationDeadline(LocalDateTime applicationDeadline) { this.applicationDeadline = applicationDeadline; return this; }
        public JobBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public JobBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Job build() {
            return new Job(id, title, companyName, location, salary, experience, description, 
                           requiredSkills, jobType, postedBy, recruiterName, isActive, applicationDeadline, createdAt, updatedAt);
        }
    }
}
