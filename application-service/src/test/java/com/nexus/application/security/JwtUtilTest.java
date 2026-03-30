package com.nexus.application.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private Key key;
    private String secret = "9a4f4c35835b8392125f187358725832a835b467e4e112448a35b467e4e22334";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
        key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Test
    void extractUsername_Success() {
        String token = Jwts.builder()
                .setSubject("user@test.com")
                .signWith(key)
                .compact();
        assertEquals("user@test.com", jwtUtil.extractUsername(token));
    }

    @Test
    void extractRole_Success() {
        String token = Jwts.builder()
                .setClaims(Map.of("role", "ROLE_ADMIN"))
                .signWith(key)
                .compact();
        assertEquals("ROLE_ADMIN", jwtUtil.extractRole(token));
    }

    @Test
    void isTokenValid_Success() {
        String token = Jwts.builder()
                .setSubject("user@test.com")
                .setExpiration(new Date(System.currentTimeMillis() + 100000))
                .signWith(key)
                .compact();
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void isTokenValid_Expired() {
        String token = Jwts.builder()
                .setSubject("user@test.com")
                .setExpiration(new Date(System.currentTimeMillis() - 100000))
                .signWith(key)
                .compact();
        assertFalse(jwtUtil.isTokenValid(token));
    }

    @Test
    void isTokenValid_InvalidSignature() {
        String token = Jwts.builder()
                .setSubject("user@test.com")
                .signWith(Keys.hmacShaKeyFor("different-secret-different-secret-different-secret".getBytes()))
                .compact();
        assertFalse(jwtUtil.isTokenValid(token));
    }
}
