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
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
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
    void apply_Success() throws Exception {
        ApplyRequest req = new ApplyRequest();
        req.setJobId(1L);
        when(applicationService.applyForJob(any(), anyLong(), anyString(), anyString())).thenReturn(new ApplicationResponse());
        
        mockMvc.perform(post("/api/applications")
                .header("X-User-Id", 100L)
                .header("X-User-Name", "Name")
                .header("X-User-Email", "email@test.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    void getMyApps_Success() throws Exception {
        when(applicationService.getUserApplications(100L)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/applications/my").header("X-User-Id", 100L))
                .andExpect(status().isOk());
    }

    @Test
    void getJobApps_Success() throws Exception {
        when(applicationService.getJobApplications(1L)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/applications/job/1")).andExpect(status().isOk());
    }

    @Test
    void updateStatus_Success() throws Exception {
        UpdateStatusRequest req = new UpdateStatusRequest();
        req.setStatus("SHORTLISTED");
        when(applicationService.updateStatus(anyLong(), any())).thenReturn(new ApplicationResponse());
        
        mockMvc.perform(put("/api/applications/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void withdraw_Success() throws Exception {
        when(applicationService.withdrawApplication(anyLong(), anyLong())).thenReturn(new ApiResponse(true, "Ok"));
        mockMvc.perform(delete("/api/applications/1").header("X-User-Id", 100L))
                .andExpect(status().isOk());
    }

    @Test
    void getStats_Success() throws Exception {
        when(applicationService.getStatusCounts()).thenReturn(new StatusCountResponse());
        mockMvc.perform(get("/api/applications/stats")).andExpect(status().isOk());
    }
}
