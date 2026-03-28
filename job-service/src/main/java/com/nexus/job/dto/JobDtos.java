package com.nexus.job.dto;

import com.nexus.job.entity.JobType;
import jakarta.validation.constraints.NotBlank;

import java.io.Serializable;
import java.util.List;

/**
 * Data Transfer Objects for Job Service requests and responses.
 */
public class JobDtos {
    private JobDtos() {
        // Utility class
    }


    public static class CreateJobRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Company name is required")
        private String companyName;

        @NotBlank(message = "Location is required")
        private String location;

        private String salary;
        private String experience;
        private String description;
        private List<String> requiredSkills;
        private JobType jobType;

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
    }

    public static class UpdateJobRequest {
        private String title;
        private String companyName;
        private String location;
        private String salary;
        private String experience;
        private String description;
        private List<String> requiredSkills;
        private JobType jobType;

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
    }


    public static class JobResponse implements Serializable {
        private Long id;
        private String title;
        private String companyName;
        private String location;
        private String salary;
        private String experience;
        private String description;
        private List<String> requiredSkills;
        private String jobType;
        private Long postedBy;
        private String recruiterName;
        private boolean active;
        private String createdAt;
        private String updatedAt;

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
        public String getJobType() { return jobType; }
        public void setJobType(String jobType) { this.jobType = jobType; }
        public Long getPostedBy() { return postedBy; }
        public void setPostedBy(Long postedBy) { this.postedBy = postedBy; }
        public String getRecruiterName() { return recruiterName; }
        public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class ApiResponse implements Serializable {
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
}
