package com.nexus.admin.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private String secret = "adminSecretKeyAdminSecretKeyAdminSecretKey";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
    }

    private String generateToken(String subject, long expirationMs, Map<String, Object> claims) {
        byte[] keyBytes = Base64.getEncoder().encode(secret.getBytes());
        Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(keyBytes));

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    void isTokenValid_Success() {
        String token = generateToken("admin@test.com", 1000 * 60, new HashMap<>());
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void isTokenValid_Expired() {
        String token = generateToken("admin@test.com", -1000, new HashMap<>());
        assertFalse(jwtUtil.isTokenValid(token));
    }

    @Test
    void isTokenValid_InvalidToken() {
        assertFalse(jwtUtil.isTokenValid("very-invalid-token"));
    }

    @Test
    void extractUsername_Success() {
        String token = generateToken("admin@test.com", 1000 * 60, new HashMap<>());
        assertEquals("admin@test.com", jwtUtil.extractUsername(token));
    }

    @Test
    void extractRole_Success() {
        Map<String, Object> claims = Map.of("role", "ADMIN");
        String token = generateToken("admin@test.com", 1000 * 60, claims);
        assertEquals("ADMIN", jwtUtil.extractRole(token));
    }
}
