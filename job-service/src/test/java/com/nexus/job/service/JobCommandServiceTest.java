package com.nexus.job.service;

import com.nexus.job.dto.JobDtos.*;
import com.nexus.job.entity.Job;
import com.nexus.job.entity.JobType;
import com.nexus.job.exception.ResourceNotFoundException;
import com.nexus.job.exception.UnauthorizedException;
import com.nexus.job.mapper.JobMapper;
import com.nexus.job.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobCommandServiceTest {

    @Mock private JobRepository jobRepository;
    @Spy private JobMapper jobMapper = new JobMapper();

    @InjectMocks private JobCommandService jobCommandService;

    private CreateJobRequest createRequest;
    private Job mockJob;

    @BeforeEach
    void setUp() {
        createRequest = new CreateJobRequest();
        createRequest.setTitle("Frontend Developer");
        createRequest.setCompanyName("Nexus Careers");
        createRequest.setLocation("Bangalore");
        createRequest.setJobType(JobType.FULL_TIME);

        mockJob = Job.builder()
                .id(2L)
                .title("Frontend Developer")
                .companyName("Nexus Careers")
                .postedBy(100L)
                .isActive(true)
                .build();
    }

    @Test
    void testCreateJob_Success() {
        when(jobRepository.save(any(Job.class))).thenReturn(mockJob);
        
        JobResponse result = jobCommandService.createJob(createRequest, 100L, "Test Recruiter");
        
        assertNotNull(result);
        assertEquals("Frontend Developer", result.getTitle());
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void testUpdateJob_Success() {
        when(jobRepository.findById(2L)).thenReturn(Optional.of(mockJob));
        when(jobRepository.save(any())).thenReturn(mockJob);

        UpdateJobRequest req = new UpdateJobRequest();
        req.setTitle("Updated Title");
        req.setCompanyName("New Co");
        req.setLocation("New Loc");
        req.setSalary("$100");
        req.setExperience("5");
        req.setDescription("New Desc");
        req.setJobType(JobType.CONTRACT);

        JobResponse result = jobCommandService.updateJob(2L, req, 100L);
        assertEquals("Updated Title", result.getTitle());
        assertEquals("New Co", result.getCompanyName());
    }

    @Test
    void testUpdateJob_NotFound() {
        when(jobRepository.findById(2L)).thenReturn(Optional.empty());
        UpdateJobRequest req = new UpdateJobRequest();
        assertThrows(ResourceNotFoundException.class, () -> jobCommandService.updateJob(2L, req, 100L));
    }

    @Test
    void testUpdateJob_Unauthorized() {
        when(jobRepository.findById(2L)).thenReturn(Optional.of(mockJob));
        UpdateJobRequest req = new UpdateJobRequest();
        assertThrows(UnauthorizedException.class, () -> jobCommandService.updateJob(2L, req, 200L));
    }

    @Test
    void testDeleteJob_Success() {
        when(jobRepository.findById(2L)).thenReturn(Optional.of(mockJob));
        
        jobCommandService.deleteJob(2L, 100L);
        
        assertFalse(mockJob.isActive());
        verify(jobRepository, times(1)).save(mockJob);
    }

    @Test
    void testDeleteJob_NotFound() {
        when(jobRepository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> jobCommandService.deleteJob(2L, 100L));
    }
}
