package com.nexus.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.auth.dto.AuthDtos.*;
import com.nexus.auth.entity.Role;
import com.nexus.auth.security.JwtAuthenticationFilter;
import com.nexus.auth.security.JwtUtil;
import com.nexus.auth.security.OAuth2LoginSuccessHandler;
import com.nexus.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_Success() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@test.com");
        req.setPassword("password123");
        req.setName("Test");
        req.setRole(Role.JOB_SEEKER);

        AuthResponse res = new AuthResponse(null, 1L, "Test", "test@test.com", "JOB_SEEKER");
        when(authService.register(any())).thenReturn(res);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    void login_Success() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@test.com");
        req.setPassword("pass");

        AuthResponse res = new AuthResponse("token", 1L, "Test", "test@test.com", "JOB_SEEKER");
        when(authService.login(any())).thenReturn(res);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void verifyOtp_Success() throws Exception {
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("test@test.com");
        req.setOtp("123456");

        AuthResponse res = new AuthResponse("token", 1L, "Test", "test@test.com", "JOB_SEEKER");
        when(authService.verifyOtp(any())).thenReturn(res);

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void sendOtp_Success() throws Exception {
        SendOtpRequest req = new SendOtpRequest();
        req.setEmail("test@test.com");

        when(authService.sendOtp(any())).thenReturn(new ApiResponse(true, "Sent"));

        mockMvc.perform(post("/api/auth/send-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void getAllUsers_Success() throws Exception {
        when(authService.getAllUsers()).thenReturn(List.of(new UserResponse(1L, "Test", "test@test.com", "JOB_SEEKER", true)));

        mockMvc.perform(get("/api/auth/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void toggleUser_Success() throws Exception {
        when(authService.toggleUserStatus(1L)).thenReturn(new ApiResponse(true, "Toggled"));

        mockMvc.perform(put("/api/auth/admin/users/1/toggle"))
                .andExpect(status().isOk());
    }

    @Test
    void forgotPassword_Success() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("test@test.com");
        
        when(authService.requestPasswordReset(any())).thenReturn(new ApiResponse(true, "Email sent"));

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void resetPassword_Success() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setToken("token");
        req.setNewPassword("newpass");

        when(authService.resetPassword(any())).thenReturn(new ApiResponse(true, "Reset success"));

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}
