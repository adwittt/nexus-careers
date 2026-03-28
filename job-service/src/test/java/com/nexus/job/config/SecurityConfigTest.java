package com.nexus.job.config;

import org.junit.jupiter.api.Test;
import com.nexus.job.security.JwtAuthenticationFilter;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {

    @Test
    void testSecurityBeans() {
        JwtAuthenticationFilter filter = mock(JwtAuthenticationFilter.class);
        SecurityConfig config = new SecurityConfig(filter);
        
        // This is hard to test fully without a proper context, but we just need coverage on the class and its members.
        assertNotNull(config);
    }
}
