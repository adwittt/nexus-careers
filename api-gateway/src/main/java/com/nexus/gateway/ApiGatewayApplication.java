package com.nexus.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * API Gateway — single entry point for all Nexus Careers microservices.
 * Port: 8080
 *
 * Responsibilities:
 *  - Route requests to Auth (8081), Job (8082), Application (8083), Admin (8084)
 *  - Validate JWT tokens on protected routes
 *  - Inject X-User-Id, X-User-Email, X-User-Role headers for downstream services
 *  - Handle CORS globally
 */
@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
