package com.nexus.admin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Service — aggregates data from Auth, Job, and Application microservices.
 * Uses RestTemplate to call downstream services with the admin's Bearer token.
 */
@Service
public class AdminService {
    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final RestTemplate restTemplate;

    @Value("${services.auth-url}")
    private String authServiceUrl;

    @Value("${services.job-url}")
    private String jobServiceUrl;

    @Value("${services.application-url}")
    private String applicationServiceUrl;

    public AdminService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Fetch all users from Auth Service.
     */
    public List<Map<String, Object>> getAllUsers(String bearerToken) {
        String url = authServiceUrl + "/api/auth/admin/users";
        HttpHeaders headers = buildHeaders(bearerToken);
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    new HttpEntity<>(headers),
                    new ParameterizedTypeReference<>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch users from auth-service: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Fetch all jobs (including inactive) from Job Service.
     */
    public List<Map<String, Object>> getAllJobs(String bearerToken) {
        String url = jobServiceUrl + "/api/jobs/admin/all";
        HttpHeaders headers = buildHeaders(bearerToken);
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    new HttpEntity<>(headers),
                    new ParameterizedTypeReference<>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch jobs from job-service: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Fetch application stats from Application Service.
     */
    public Map<String, Object> getApplicationStats(String bearerToken) {
        String url = applicationServiceUrl + "/api/applications/stats";
        HttpHeaders headers = buildHeaders(bearerToken);
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    new HttpEntity<>(headers),
                    new ParameterizedTypeReference<>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch stats from application-service: {}", e.getMessage());
            return Map.of();
        }
    }

    /**
     * Aggregate dashboard report:
     * - Total users (by role breakdown)
     * - Total active jobs
     * - Application status breakdown
     */
    public Map<String, Object> getDashboardReport(String bearerToken) {
        List<Map<String, Object>> users = getAllUsers(bearerToken);
        List<Map<String, Object>> jobs  = getAllJobs(bearerToken);
        Map<String, Object> appStats    = getApplicationStats(bearerToken);

        long totalUsers  = users.size();
        long jobSeekers  = users.stream().filter(u -> "JOB_SEEKER".equals(u.get("role"))).count();
        long recruiters  = users.stream().filter(u -> "RECRUITER".equals(u.get("role"))).count();
        long totalJobs   = jobs.size();

        LocalDateTime now = LocalDateTime.now();
        long activeJobs  = jobs.stream().filter(j -> Boolean.TRUE.equals(j.get("active")) && !isDeadlinePast(j, now)).count();
        long expiredJobs = jobs.stream().filter(j -> Boolean.TRUE.equals(j.get("active")) && isDeadlinePast(j, now)).count();

        Map<String, Object> result = new HashMap<>();
        result.put("totalUsers", totalUsers);
        result.put("jobSeekers", jobSeekers);
        result.put("recruiters", recruiters);
        result.put("totalJobs", totalJobs);
        result.put("activeJobs", activeJobs);
        result.put("expiredJobs", expiredJobs);
        result.put("applications", appStats);
        return result;
    }

    /**
     * Toggle user active/inactive status.
     */
    public Map<String, Object> toggleUserStatus(Long userId, String bearerToken) {
        String url = authServiceUrl + "/api/auth/admin/users/" + userId + "/toggle";
        HttpHeaders headers = buildHeaders(bearerToken);
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.PUT,
                    new HttpEntity<>(headers),
                    new ParameterizedTypeReference<>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to toggle user: {}", e.getMessage());
            return Map.of("success", false, "message", e.getMessage());
        }
    }

    private HttpHeaders buildHeaders(String bearerToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", bearerToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /**
     * Check if a job's applicationDeadline is in the past.
     */
    private boolean isDeadlinePast(Map<String, Object> job, LocalDateTime now) {
        Object deadline = job.get("applicationDeadline");
        if (deadline == null) return false;
        try {
            return LocalDateTime.parse(deadline.toString()).isBefore(now);
        } catch (Exception e) {
            return false;
        }
    }
}
