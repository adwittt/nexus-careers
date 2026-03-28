package com.nexus.auth.controller;

import com.nexus.auth.dto.AuthDtos.*;
import com.nexus.auth.entity.Role;
import com.nexus.auth.service.AuthService;
import com.nexus.auth.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private AuthService authService;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private UserDetailsService userDetailsService;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void register_Success() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@test.com");
        req.setPassword("pass123");
        req.setName("Test");
        req.setRole(Role.JOB_SEEKER);

        AuthResponse res = new AuthResponse("token", 1L, "Test", "test@test.com", "JOB_SEEKER");
        when(authService.register(any())).thenReturn(res);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test@test.com"));
    }

    @Test
    void login_Success() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@test.com");
        req.setPassword("pass123");

        AuthResponse res = new AuthResponse("token", 1L, "Test", "test@test.com", "JOB_SEEKER");
        when(authService.login(any())).thenReturn(res);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("token"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_Success() throws Exception {
        UserResponse user = new UserResponse();
        user.setEmail("user1@test.com");
        when(authService.getAllUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/auth/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("user1@test.com"));
    }

    @Test
    void forgotPassword_Success() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("test@test.com");
        when(authService.requestPasswordReset(any())).thenReturn(new ApiResponse(true, "Sent"));

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void resetPassword_Success() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setToken("tok123");
        req.setNewPassword("newpass");
        when(authService.resetPassword(any())).thenReturn(new ApiResponse(true, "Reset"));

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}
