package com.nexus.job.mapper;

import com.nexus.job.dto.JobDtos.JobResponse;
import com.nexus.job.entity.Job;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Job entity and DTOs.
 */
@Component
public class JobMapper {

    public JobResponse toResponse(Job job) {
        if (job == null) return null;

        JobResponse r = new JobResponse();
        r.setId(job.getId());
        r.setTitle(job.getTitle());
        r.setCompanyName(job.getCompanyName());
        r.setLocation(job.getLocation());
        r.setSalary(job.getSalary());
        r.setExperience(job.getExperience());
        r.setDescription(job.getDescription());
        r.setRequiredSkills(job.getRequiredSkills());
        r.setJobType(job.getJobType() != null ? job.getJobType().name() : null);
        r.setPostedBy(job.getPostedBy());
        r.setRecruiterName(job.getRecruiterName());
        r.setActive(job.isActive());
        r.setCreatedAt(job.getCreatedAt() != null ? job.getCreatedAt().toString() : null);
        r.setApplicationDeadline(job.getApplicationDeadline() != null ? job.getApplicationDeadline().toString() : null);
        r.setUpdatedAt(job.getUpdatedAt() != null ? job.getUpdatedAt().toString() : null);
        return r;
    }
}
