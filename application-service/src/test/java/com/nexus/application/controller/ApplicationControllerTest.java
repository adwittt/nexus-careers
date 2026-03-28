package com.nexus.application.controller;

import com.nexus.application.dto.ApplicationDtos.*;
import com.nexus.application.service.ApplicationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ApplicationController.class)
@AutoConfigureMockMvc
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ApplicationService applicationService;

    @MockBean
    private com.nexus.application.security.JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "JOB_SEEKER")
    void applyForJob_Success() throws Exception {
        ApplyRequest req = new ApplyRequest();
        req.setJobId(1L);
        req.setResumeUrl("http://resume.com");
        
        ApplicationResponse resp = new ApplicationResponse();
        resp.setId(10L);
        resp.setJobTitle("Dev");

        when(applicationService.applyForJob(any(), eq(100L), eq("John"), anyString())).thenReturn(resp);

        mockMvc.perform(post("/api/applications")
                .header("X-User-Id", 100L)
                .header("X-User-Name", "John")
                .header("X-User-Email", "john@test.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.jobTitle").value("Dev"));
    }

    @Test
    @WithMockUser(roles = "JOB_SEEKER")
    void getMyApplications_Success() throws Exception {
        when(applicationService.getUserApplications(100L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/applications/user")
                .header("X-User-Id", 100L))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void getJobApplications_Success() throws Exception {
        when(applicationService.getJobApplications(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/applications/job/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "JOB_SEEKER")
    void withdraw_Success() throws Exception {
        when(applicationService.withdrawApplication(10L, 100L)).thenReturn(new ApiResponse(true, "Success"));

        mockMvc.perform(delete("/api/applications/10")
                .header("X-User-Id", 100L)
                .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getStats_Success() throws Exception {
        StatusCountResponse stats = new StatusCountResponse();
        stats.setTotal(50L);

        when(applicationService.getStatusCounts()).thenReturn(stats);

        mockMvc.perform(get("/api/applications/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(50L));
    }
}
