package com.nexus.admin.controller;

import com.nexus.admin.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Controller — all endpoints require ADMIN role.
 * Aggregates data from downstream microservices.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Platform administration — user management, analytics, reports")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * Get all registered users across the platform.
     */
    @GetMapping("/users")
    @Operation(summary = "Get all users", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(adminService.getAllUsers(token));
    }

    /**
     * Get all job postings (active + inactive).
     */
    @GetMapping("/jobs")
    @Operation(summary = "Get all jobs", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<Map<String, Object>>> getAllJobs(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(adminService.getAllJobs(token));
    }

    /**
     * Get aggregated dashboard report:
     * user counts, job counts, application status breakdown.
     */
    @GetMapping("/reports")
    @Operation(summary = "Get dashboard analytics report", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> getReports(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(adminService.getDashboardReport(token));
    }

    /**
     * Toggle a user's active status (activate / deactivate).
     */
    @PutMapping("/users/{userId}/toggle")
    @Operation(summary = "Toggle user active status", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> toggleUserStatus(
            @PathVariable("userId") Long userId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(adminService.toggleUserStatus(userId, token));
    }
}
