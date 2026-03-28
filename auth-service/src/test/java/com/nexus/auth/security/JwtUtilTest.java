package com.nexus.auth.security;

import com.nexus.auth.entity.Role;
import com.nexus.auth.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private User user;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "myverysecretandlongkeyformakingjwtworkproperly12345");
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", 3600000L);

        user = User.builder()
                .id(1L)
                .name("Test")
                .email("test@test.com")
                .role(Role.JOB_SEEKER)
                .build();
    }

    @Test
    void testTokenGenerationAndExtraction() {
        String token = jwtUtil.generateToken(user);
        assertNotNull(token);

        String username = jwtUtil.extractUsername(token);
        assertEquals("test@test.com", username);
    }

    @Test
    void testTokenValidation() {
        String token = jwtUtil.generateToken(user);
        assertTrue(jwtUtil.isTokenValid(token, user));
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtUtil.isTokenValid("invalid.token.here"));
    }
}
