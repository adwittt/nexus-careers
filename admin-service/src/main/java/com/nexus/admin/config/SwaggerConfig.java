package com.nexus.admin.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(title = "Nexus Careers - Admin Service API", version = "1.0",
                 description = "Admin dashboard — user management, analytics, reports"),
    servers = {
        @Server(url = "http://localhost:8084", description = "Admin Service"),
        @Server(url = "http://localhost:8080", description = "API Gateway")
    }
)
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, bearerFormat = "JWT", scheme = "bearer")
public class SwaggerConfig {}
