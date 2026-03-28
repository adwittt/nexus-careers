package com.nexus.application.service;

import com.nexus.application.dto.ApplicationDtos.*;
import com.nexus.application.entity.Application;
import com.nexus.application.entity.ApplicationStatus;
import com.nexus.application.exception.ResourceNotFoundException;
import com.nexus.application.exception.UnauthorizedException;
import com.nexus.application.repository.ApplicationRepository;
import com.nexus.application.client.JobServiceClient;
import com.nexus.application.client.JobDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private JobServiceClient jobServiceClient;
    @Mock
    private ApplicationMessageProducer messageProducer;

    @InjectMocks
    private ApplicationService applicationService;

    private ApplyRequest applyRequest;
    private JobDto jobDto;

    @BeforeEach
    void setUp() {
        applyRequest = new ApplyRequest();
        applyRequest.setJobId(1L);
        applyRequest.setResumeUrl("http://resume.com");
        applyRequest.setCoverLetter("Hi");

        jobDto = new JobDto();
        jobDto.setId(1L);
        jobDto.setTitle("Dev");
        jobDto.setCompanyName("Nexus");
        jobDto.setActive(true);
    }

    @Test
    void applyForJob_Success() {
        when(jobServiceClient.getJobById(1L)).thenReturn(jobDto);
        when(applicationRepository.existsByUserIdAndJobId(100L, 1L)).thenReturn(false);
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArguments()[0]);

        ApplicationResponse response = applicationService.applyForJob(applyRequest, 100L, "John", "john@test.com");

        assertNotNull(response);
        assertEquals("Dev", response.getJobTitle());
        assertEquals(ApplicationStatus.APPLIED.name(), response.getStatus());
        verify(messageProducer).sendApplicationEvent(anyString());
    }

    @Test
    void applyForJob_JobNotFound() {
        when(jobServiceClient.getJobById(1L)).thenThrow(new RuntimeException("Down"));
        assertThrows(ResourceNotFoundException.class, () -> applicationService.applyForJob(applyRequest, 100L, "John", "john@test.com"));
    }

    @Test
    void applyForJob_JobInactive() {
        jobDto.setActive(false);
        when(jobServiceClient.getJobById(1L)).thenReturn(jobDto);
        assertThrows(IllegalStateException.class, () -> applicationService.applyForJob(applyRequest, 100L, "John", "john@test.com"));
    }

    @Test
    void applyForJob_DuplicateFails() {
        when(jobServiceClient.getJobById(1L)).thenReturn(jobDto);
        when(applicationRepository.existsByUserIdAndJobId(100L, 1L)).thenReturn(true);
        assertThrows(RuntimeException.class, () -> applicationService.applyForJob(applyRequest, 100L, "John", "john@test.com"));
    }

    @Test
    void updateStatus_Success() {
        Application app = new Application();
        app.setStatus(ApplicationStatus.APPLIED);
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(app));
        when(applicationRepository.save(any())).thenReturn(app);

        UpdateStatusRequest req = new UpdateStatusRequest();
        req.setStatus("UNDER_REVIEW");
        req.setRecruiterNotes("Looks good");
        
        ApplicationResponse resp = applicationService.updateStatus(10L, req);
        assertEquals("UNDER_REVIEW", resp.getStatus());
    }

    @Test
    void updateStatus_InvalidTransition() {
        Application app = new Application();
        app.setStatus(ApplicationStatus.REJECTED);
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(app));

        UpdateStatusRequest req = new UpdateStatusRequest();
        req.setStatus("SHORTLISTED");
        
        assertThrows(IllegalStateException.class, () -> applicationService.updateStatus(10L, req));
    }

    @Test
    void withdrawApplication_Success() {
        Application app = new Application();
        app.setUserId(100L);
        app.setStatus(ApplicationStatus.APPLIED);
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(app));

        ApiResponse resp = applicationService.withdrawApplication(10L, 100L);
        assertTrue(resp.isSuccess());
        verify(applicationRepository).delete(app);
    }

    @Test
    void withdrawApplication_Unauthorized() {
        Application app = new Application();
        app.setUserId(200L);
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(app));

        assertThrows(UnauthorizedException.class, () -> applicationService.withdrawApplication(10L, 100L));
    }

    @Test
    void withdrawApplication_ShortlistedFails() {
        Application app = new Application();
        app.setUserId(100L);
        app.setStatus(ApplicationStatus.SHORTLISTED);
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(app));

        assertThrows(IllegalStateException.class, () -> applicationService.withdrawApplication(10L, 100L));
    }

    @Test
    void getUserApplications_Success() {
        when(applicationRepository.findByUserIdOrderByAppliedAtDesc(100L)).thenReturn(List.of(new Application()));
        List<ApplicationResponse> result = applicationService.getUserApplications(100L);
        assertEquals(1, result.size());
    }

    @Test
    void getJobApplications_Success() {
        when(applicationRepository.findByJobIdOrderByAppliedAtDesc(1L)).thenReturn(List.of(new Application()));
        List<ApplicationResponse> result = applicationService.getJobApplications(1L);
        assertEquals(1, result.size());
    }

    @Test
    void getStatusCounts_Success() {
        when(applicationRepository.countByStatus(any())).thenReturn(5L);
        when(applicationRepository.count()).thenReturn(20L);

        StatusCountResponse resp = applicationService.getStatusCounts();
        assertEquals(5L, resp.getApplied());
        assertEquals(20L, resp.getTotal());
    }
}
