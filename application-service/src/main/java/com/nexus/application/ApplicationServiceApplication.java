package com.nexus.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Application Service - manages job applications lifecycle.
 * Handles apply, track, status updates (APPLIED → UNDER_REVIEW → SHORTLISTED/REJECTED)
 */
@SpringBootApplication
@EnableFeignClients
public class ApplicationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApplicationServiceApplication.class, args);
    }
}
