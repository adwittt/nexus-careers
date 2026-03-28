package com.nexus.admin.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private AdminService adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminService(restTemplate);
        ReflectionTestUtils.setField(adminService, "authServiceUrl", "http://auth");
        ReflectionTestUtils.setField(adminService, "jobServiceUrl", "http://job");
        ReflectionTestUtils.setField(adminService, "applicationServiceUrl", "http://app");
    }

    @Test
    void getAllUsers_Success() {
        List<Map<String, Object>> expected = List.of(Map.of("id", 1, "role", "ADMIN"));
        ResponseEntity<List<Map<String, Object>>> resp = new ResponseEntity<>(expected, HttpStatus.OK);
        when(restTemplate.exchange(eq("http://auth/api/auth/admin/users"), eq(HttpMethod.GET),
                any(HttpEntity.class), any(ParameterizedTypeReference.class))).thenReturn(resp);

        List<Map<String, Object>> result = adminService.getAllUsers("Bearer token");
        assertFalse(result.isEmpty());
        assertEquals(1, result.get(0).get("id"));
    }

    @Test
    void getAllUsers_Error() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET),
                any(HttpEntity.class), any(ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("Connection refused"));

        List<Map<String, Object>> result = adminService.getAllUsers("Bearer token");
        assertTrue(result.isEmpty());
    }

    @Test
    void getAllJobs_Success() {
        List<Map<String, Object>> expected = List.of(Map.of("id", 1, "active", true));
        ResponseEntity<List<Map<String, Object>>> resp = new ResponseEntity<>(expected, HttpStatus.OK);
        when(restTemplate.exchange(eq("http://job/api/jobs/admin/all"), eq(HttpMethod.GET),
                any(HttpEntity.class), any(ParameterizedTypeReference.class))).thenReturn(resp);

        List<Map<String, Object>> result = adminService.getAllJobs("Bearer token");
        assertEquals(1, result.size());
    }

    @Test
    void getAllJobs_Error() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET),
                any(HttpEntity.class), any(ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("timeout"));

        List<Map<String, Object>> result = adminService.getAllJobs("Bearer token");
        assertTrue(result.isEmpty());
    }

    @Test
    void getApplicationStats_Success() {
        Map<String, Object> expected = Map.of("total", 10);
        ResponseEntity<Map<String, Object>> resp = new ResponseEntity<>(expected, HttpStatus.OK);
        when(restTemplate.exchange(eq("http://app/api/applications/stats"), eq(HttpMethod.GET),
                any(HttpEntity.class), any(ParameterizedTypeReference.class))).thenReturn(resp);

        Map<String, Object> result = adminService.getApplicationStats("Bearer token");
        assertEquals(10, result.get("total"));
    }

    @Test
    void getApplicationStats_Error() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET),
                any(HttpEntity.class), any(ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("down"));

        Map<String, Object> result = adminService.getApplicationStats("Bearer token");
        assertTrue(result.isEmpty());
    }

    @Test
    void getDashboardReport_Success() {
        // Mock getAllUsers
        List<Map<String, Object>> users = List.of(
                Map.of("role", "JOB_SEEKER"),
                Map.of("role", "RECRUITER"),
                Map.of("role", "ADMIN")
        );
        ResponseEntity<List<Map<String, Object>>> usersResp = new ResponseEntity<>(users, HttpStatus.OK);
        when(restTemplate.exchange(eq("http://auth/api/auth/admin/users"), eq(HttpMethod.GET),
                any(HttpEntity.class), any(ParameterizedTypeReference.class))).thenReturn(usersResp);

        // Mock getAllJobs
        List<Map<String, Object>> jobs = List.of(
                Map.of("active", true),
                Map.of("active", false)
        );
        ResponseEntity<List<Map<String, Object>>> jobsResp = new ResponseEntity<>(jobs, HttpStatus.OK);
        when(restTemplate.exchange(eq("http://job/api/jobs/admin/all"), eq(HttpMethod.GET),
                any(HttpEntity.class), any(ParameterizedTypeReference.class))).thenReturn(jobsResp);

        // Mock getApplicationStats
        Map<String, Object> stats = Map.of("total", 5);
        ResponseEntity<Map<String, Object>> statsResp = new ResponseEntity<>(stats, HttpStatus.OK);
        when(restTemplate.exchange(eq("http://app/api/applications/stats"), eq(HttpMethod.GET),
                any(HttpEntity.class), any(ParameterizedTypeReference.class))).thenReturn(statsResp);

        Map<String, Object> report = adminService.getDashboardReport("Bearer token");
        assertEquals(3L, report.get("totalUsers"));
        assertEquals(1L, report.get("jobSeekers"));
        assertEquals(1L, report.get("recruiters"));
        assertEquals(2L, report.get("totalJobs"));
        assertEquals(1L, report.get("activeJobs"));
    }

    @Test
    void toggleUserStatus_Success() {
        Map<String, Object> expected = Map.of("success", true);
        ResponseEntity<Map<String, Object>> resp = new ResponseEntity<>(expected, HttpStatus.OK);
        when(restTemplate.exchange(eq("http://auth/api/auth/admin/users/1/toggle"), eq(HttpMethod.PUT),
                any(HttpEntity.class), any(ParameterizedTypeReference.class))).thenReturn(resp);

        Map<String, Object> result = adminService.toggleUserStatus(1L, "Bearer token");
        assertTrue((Boolean) result.get("success"));
    }

    @Test
    void toggleUserStatus_Error() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.PUT),
                any(HttpEntity.class), any(ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("failed"));

        Map<String, Object> result = adminService.toggleUserStatus(1L, "Bearer token");
        assertFalse((Boolean) result.get("success"));
    }
}
