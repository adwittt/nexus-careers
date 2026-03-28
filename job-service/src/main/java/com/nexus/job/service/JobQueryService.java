package com.nexus.job.service;

import com.nexus.job.dto.JobDtos.*;
import com.nexus.job.entity.Job;
import com.nexus.job.entity.JobType;
import com.nexus.job.exception.ResourceNotFoundException;
import com.nexus.job.mapper.JobMapper;
import com.nexus.job.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class JobQueryService {
    private static final Logger log = LoggerFactory.getLogger(JobQueryService.class);
    private final JobRepository jobRepository;
    private final JobMapper jobMapper;

    public JobQueryService(JobRepository jobRepository, JobMapper jobMapper) {
        this.jobRepository = jobRepository;
        this.jobMapper = jobMapper;
    }

    @Cacheable(value = "jobs")
    public List<JobResponse> getAllJobs() {
        return jobRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream().map(jobMapper::toResponse).toList();
    }

    @Cacheable(value = "job", key = "#a0")
    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        return jobMapper.toResponse(job);
    }

    public List<JobResponse> searchJobs(String title, String location, String jobType, String experience) {
        JobType type = null;
        if (jobType != null && !jobType.isBlank()) {
            try { type = JobType.valueOf(jobType.toUpperCase()); } catch (IllegalArgumentException e) { log.warn("Invalid job type filter: {}", jobType); }
        }
        String titleParam = (title != null && !title.isBlank()) ? title : null;
        String locationParam = (location != null && !location.isBlank()) ? location : null;
        String experienceParam = (experience != null && !experience.isBlank()) ? experience : null;

        return jobRepository.searchJobs(titleParam, locationParam, type, experienceParam).stream().map(jobMapper::toResponse).toList();
    }

    public List<JobResponse> getJobsByRecruiter(Long recruiterId) {
        return jobRepository.findByPostedByAndIsActiveTrueOrderByCreatedAtDesc(recruiterId).stream().map(jobMapper::toResponse).toList();
    }

    public List<JobResponse> getAllJobsForAdmin() {
        return jobRepository.findAll().stream().map(jobMapper::toResponse).toList();
    }

    public long getTotalActiveJobs() {
        return jobRepository.countByIsActiveTrue();
    }
}
