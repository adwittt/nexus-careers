package com.nexus.job.service;

import com.nexus.job.dto.JobDtos.*;
import com.nexus.job.entity.Job;
import com.nexus.job.entity.JobType;
import com.nexus.job.exception.ResourceNotFoundException;
import com.nexus.job.exception.UnauthorizedException;
import com.nexus.job.mapper.JobMapper;
import com.nexus.job.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class JobCommandService {
    private static final Logger log = LoggerFactory.getLogger(JobCommandService.class);
    private final JobRepository jobRepository;
    private final JobMapper jobMapper;

    public JobCommandService(JobRepository jobRepository, JobMapper jobMapper) {
        this.jobRepository = jobRepository;
        this.jobMapper = jobMapper;
    }

    @CacheEvict(value = {"jobs", "job"}, allEntries = true)
    public JobResponse createJob(CreateJobRequest request, Long recruiterId, String recruiterName) {
        Job job = Job.builder()
                .title(request.getTitle())
                .companyName(request.getCompanyName())
                .location(request.getLocation())
                .salary(request.getSalary())
                .experience(request.getExperience())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills() != null ? request.getRequiredSkills() : List.of())
                .jobType(request.getJobType() != null ? request.getJobType() : JobType.FULL_TIME)
                .postedBy(recruiterId)
                .recruiterName(recruiterName)
                .build();
        Job saved = jobRepository.save(job);
        log.info("Job created: '{}' by recruiter {}", saved.getTitle(), recruiterId);
        return jobMapper.toResponse(saved);
    }

    @CacheEvict(value = {"jobs", "job"}, allEntries = true)
    public JobResponse updateJob(Long jobId, UpdateJobRequest request, Long recruiterId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        if (!job.getPostedBy().equals(recruiterId)) throw new UnauthorizedException("You are not authorized to update this job");
        
        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getCompanyName() != null) job.setCompanyName(request.getCompanyName());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getSalary() != null) job.setSalary(request.getSalary());
        if (request.getExperience() != null) job.setExperience(request.getExperience());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getRequiredSkills() != null) job.setRequiredSkills(request.getRequiredSkills());
        if (request.getJobType() != null) job.setJobType(request.getJobType());
        
        return jobMapper.toResponse(jobRepository.save(job));
    }

    @CacheEvict(value = {"jobs", "job"}, allEntries = true)
    public ApiResponse deleteJob(Long jobId, Long recruiterId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        if (!job.getPostedBy().equals(recruiterId)) throw new UnauthorizedException("You are not authorized to delete this job");
        
        job.setActive(false);
        jobRepository.save(job);
        log.info("Job {} soft-deleted by recruiter {}", jobId, recruiterId);
        return new ApiResponse(true, "Job deleted successfully");
    }
}
