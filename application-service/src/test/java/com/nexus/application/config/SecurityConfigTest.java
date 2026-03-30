package com.nexus.application.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
class SecurityConfigTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void configLoad_Success() {
        assertNotNull(context.getBean(SecurityFilterChain.class));
    }
}
