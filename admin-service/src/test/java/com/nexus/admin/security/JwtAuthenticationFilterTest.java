package com.nexus.admin.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock private JwtUtil jwtUtil;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain filterChain;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtUtil);
        SecurityContextHolder.clearContext();
    }

    @Test
    void testXUserHeader_Success() throws ServletException, IOException {
        when(request.getHeader("X-User-Email")).thenReturn("test@test.com");
        when(request.getHeader("X-User-Role")).thenReturn("ADMIN");

        filter.doFilterInternal(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("test@test.com", SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testBearerToken_Success() throws ServletException, IOException {
        lenient().when(request.getHeader("X-User-Email")).thenReturn(null);
        lenient().when(request.getHeader("X-User-Role")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer token");
        when(jwtUtil.isTokenValid("token")).thenReturn(true);
        when(jwtUtil.extractUsername("token")).thenReturn("admin@test.com");
        when(jwtUtil.extractRole("token")).thenReturn("ROLE_ADMIN");

        filter.doFilterInternal(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testBearerToken_Invalid() throws ServletException, IOException {
        lenient().when(request.getHeader("X-User-Email")).thenReturn(null);
        lenient().when(request.getHeader("X-User-Role")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid");
        when(jwtUtil.isTokenValid("invalid")).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testNoHeader() throws ServletException, IOException {
        lenient().when(request.getHeader(anyString())).thenReturn(null);
        filter.doFilterInternal(request, response, filterChain);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}
