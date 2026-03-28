package com.nexus.auth.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger 3 configuration for Auth Service.
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Nexus Careers - Auth Service API",
        version = "1.0",
        description = "Authentication & Authorization microservice for Nexus Careers Job Portal",
        contact = @Contact(name = "Nexus Careers", email = "support@nexuscareers.com")
    ),
    servers = {
        @Server(url = "http://localhost:8081", description = "Auth Service"),
        @Server(url = "http://localhost:8080", description = "API Gateway")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
public class SwaggerConfig {
    // Configuration is annotation-driven
}
