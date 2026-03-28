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

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private String secret = "adminSecretKeyAdminSecretKeyAdminSecretKey";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
    }

    private String generateToken(String subject, long expirationMs) {
        byte[] keyBytes = Base64.getEncoder().encode(secret.getBytes());
        Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(keyBytes));

        return Jwts.builder()
                .setClaims(new HashMap<>())
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    void isTokenValid_Success() {
        String token = generateToken("admin@test.com", 1000 * 60);
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void extractUsername_Success() {
        String token = generateToken("admin@test.com", 1000 * 60);
        assertEquals("admin@test.com", jwtUtil.extractUsername(token));
    }
}
