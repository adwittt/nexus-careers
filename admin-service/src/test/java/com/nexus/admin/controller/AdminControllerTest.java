package com.nexus.admin.controller;

import com.nexus.admin.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private com.nexus.admin.security.JwtUtil jwtUtil;

    @Test
    void getReports_Success() throws Exception {
        when(adminService.getDashboardReport(anyString())).thenReturn(Map.of("totalUsers", 10));
        mockMvc.perform(get("/api/admin/reports")
                .header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(10));
    }

    @Test
    void getAllUsers_Success() throws Exception {
        when(adminService.getAllUsers(anyString())).thenReturn(List.of(Map.of("username", "test")));
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllJobs_Success() throws Exception {
        when(adminService.getAllJobs(anyString())).thenReturn(List.of(Map.of("title", "Job")));
        mockMvc.perform(get("/api/admin/jobs")
                .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());
    }

    @Test
    void toggleUser_Success() throws Exception {
        when(adminService.toggleUserStatus(anyLong(), anyString())).thenReturn(Map.of("success", true));
        mockMvc.perform(put("/api/admin/users/1/toggle")
                .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());
    }
}
