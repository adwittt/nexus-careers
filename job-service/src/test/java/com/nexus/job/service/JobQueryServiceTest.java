package com.nexus.job.service;

import com.nexus.job.dto.JobDtos.JobResponse;
import com.nexus.job.entity.Job;
import com.nexus.job.exception.ResourceNotFoundException;
import com.nexus.job.mapper.JobMapper;
import com.nexus.job.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobQueryServiceTest {

    @Mock private JobRepository jobRepository;
    @Spy private JobMapper jobMapper = new JobMapper();

    @InjectMocks private JobQueryService jobQueryService;

    @Test
    void getAllJobs_Success() {
        when(jobRepository.findByIsActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(new Job()));
        List<JobResponse> result = jobQueryService.getAllJobs();
        assertEquals(1, result.size());
    }

    @Test
    void getJobById_Success() {
        Job job = Job.builder().id(1L).isActive(true).build();
        when(jobRepository.findById(1L)).thenReturn(Optional.of(job));
        JobResponse result = jobQueryService.getJobById(1L);
        assertNotNull(result);
    }

    @Test
    void getJobById_NotFound() {
        when(jobRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> jobQueryService.getJobById(1L));
    }

    @Test
    void searchJobs_ManyFilters_Success() {
        when(jobRepository.searchJobs(any(), any(), any(), any(), any())).thenReturn(List.of(new Job()));
        List<JobResponse> result = jobQueryService.searchJobs("Title", "Location", "PART_TIME", "Junior", "50000");
        assertEquals(1, result.size());
    }

    @Test
    void searchJobs_NullFilters_Success() {
        when(jobRepository.searchJobs(any(), any(), any(), any(), any())).thenReturn(Collections.emptyList());
        List<JobResponse> result = jobQueryService.searchJobs(null, null, null, null, null);
        assertEquals(0, result.size());
    }

    @Test
    void getAllJobsForAdmin_Success() {
        when(jobRepository.findAll()).thenReturn(List.of(new Job(), new Job()));
        List<JobResponse> result = jobQueryService.getAllJobsForAdmin();
        assertEquals(2, result.size());
    }

    @Test
    void getTotalActiveJobs_Success() {
        when(jobRepository.countByIsActiveTrue()).thenReturn(5L);
        long result = jobQueryService.getTotalActiveJobs();
        assertEquals(5L, result);
    }
}
