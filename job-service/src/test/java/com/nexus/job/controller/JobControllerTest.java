package com.nexus.job.controller;

import com.nexus.job.dto.JobDtos.*;
import com.nexus.job.service.JobCommandService;
import com.nexus.job.service.JobQueryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobController.class)
@AutoConfigureMockMvc(addFilters = false)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobCommandService jobCommandService;
    @MockBean
    private JobQueryService jobQueryService;
    @MockBean
    private com.nexus.job.security.JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createJob_Success() throws Exception {
        CreateJobRequest req = new CreateJobRequest();
        req.setTitle("Dev");
        req.setCompanyName("Nexus");
        req.setLocation("Bangalore");
        
        JobResponse resp = new JobResponse();
        resp.setTitle("Dev");

        when(jobCommandService.createJob(any(), anyLong(), anyString())).thenReturn(resp);

        mockMvc.perform(post("/api/jobs")
                .header("X-User-Id", 100L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    void getAllJobs_Success() throws Exception {
        when(jobQueryService.getAllJobs()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/jobs")).andExpect(status().isOk());
    }

    @Test
    void getJobById_Success() throws Exception {
        when(jobQueryService.getJobById(1L)).thenReturn(new JobResponse());
        mockMvc.perform(get("/api/jobs/1")).andExpect(status().isOk());
    }

    @Test
    void searchJobs_Success() throws Exception {
        when(jobQueryService.searchJobs(any(), any(), any(), any())).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/jobs/search?title=Dev")).andExpect(status().isOk());
    }

    @Test
    void updateJob_Success() throws Exception {
        when(jobCommandService.updateJob(anyLong(), any(), anyLong())).thenReturn(new JobResponse());
        mockMvc.perform(put("/api/jobs/1")
                .header("X-User-Id", 100L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteJob_Success() throws Exception {
        when(jobCommandService.deleteJob(anyLong(), anyLong())).thenReturn(new ApiResponse(true, "Deleted"));
        mockMvc.perform(delete("/api/jobs/1")
                .header("X-User-Id", 100L))
                .andExpect(status().isOk());
    }

    @Test
    void getRecruiterJobs_Success() throws Exception {
        when(jobQueryService.getJobsByRecruiter(100L)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/jobs/recruiter/100")).andExpect(status().isOk());
    }

    @Test
    void getAllJobsAdmin_Success() throws Exception {
        when(jobQueryService.getAllJobsForAdmin()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/jobs/admin/all")).andExpect(status().isOk());
    }
}
