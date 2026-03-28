package com.nexus.gateway.security;

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
    private String secret = "testSecretKeyTestSecretKeyTestSecretKey";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
    }

    private String generateToken(String subject, Map<String, Object> claims, long expirationMs) {
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
    void isTokenValid_ValidToken_ReturnsTrue() {
        String token = generateToken("test@test.com", new HashMap<>(), 1000 * 60);
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void isTokenValid_ExpiredToken_ReturnsFalse() {
        String token = generateToken("test@test.com", new HashMap<>(), -1000 * 60);
        assertFalse(jwtUtil.isTokenValid(token));
    }

    @Test
    void extractUsername_ReturnsSubject() {
        String token = generateToken("john@test.com", new HashMap<>(), 1000 * 60);
        assertEquals("john@test.com", jwtUtil.extractUsername(token));
    }

    @Test
    void extractRole_ReturnsRoleClaim() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ROLE_ADMIN");
        String token = generateToken("admin@test.com", claims, 1000 * 60);
        assertEquals("ROLE_ADMIN", jwtUtil.extractRole(token));
    }

    @Test
    void extractUserId_ReturnsUserIdClaim() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", 123L);
        String token = generateToken("user@test.com", claims, 1000 * 60);
        assertEquals("123", jwtUtil.extractUserId(token));
    }

    @Test
    void extractName_ReturnsNameClaim() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("name", "John Doe");
        String token = generateToken("user@test.com", claims, 1000 * 60);
        assertEquals("John Doe", jwtUtil.extractName(token));
    }

    @Test
    void isTokenValid_MalformedToken_ReturnsFalse() {
        assertFalse(jwtUtil.isTokenValid("not.a.token"));
    }
}
