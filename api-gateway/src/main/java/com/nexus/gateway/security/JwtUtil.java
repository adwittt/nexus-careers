package com.nexus.gateway.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

/**
 * JWT utility for the API Gateway.
 * Validates tokens and extracts claims to inject into downstream request headers.
 */
@Component
public class JwtUtil {
    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    /** Extract email (subject) from token */
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    /** Extract ROLE_XXX authority stored in 'role' claim */
    public String extractRole(String token) {
        return (String) extractClaims(token).get("role");
    }

    /** Extract user ID stored in 'userId' claim */
    public String extractUserId(String token) {
        Object id = extractClaims(token).get("userId");
        return id != null ? id.toString() : null;
    }

    /** FIX: Extract real display name from 'name' claim */
    public String extractName(String token) {
        Object name = extractClaims(token).get("name");
        return name != null ? name.toString() : null;
    }

    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Base64.getEncoder().encode(secret.getBytes());
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(keyBytes));
    }
}
