package com.nexus.auth.service;

import com.nexus.auth.dto.AuthDtos.*;
import com.nexus.auth.entity.PasswordResetToken;
import com.nexus.auth.entity.User;
import com.nexus.auth.entity.Role;
import com.nexus.auth.repository.PasswordResetTokenRepository;
import com.nexus.auth.repository.UserRepository;
import com.nexus.auth.security.JwtUtil;
import com.nexus.auth.exception.ResourceAlreadyExistsException;
import com.nexus.auth.exception.InvalidOtpException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private EmailService emailService;
    @Mock private PasswordResetTokenRepository tokenRepository;

    @InjectMocks private AuthService authService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encoded_pass")
                .role(Role.JOB_SEEKER)
                .isActive(true)
                .emailVerified(true)
                .build();
    }

    @Test
    void register_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("pass12345");
        req.setRole(Role.JOB_SEEKER);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertNull(res.getAccessToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_Failure_AlreadyExists() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@example.com");

        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> authService.register(req));
    }

    @Test
    void login_Success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("pass123");

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(mockUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtil.generateToken(mockUser)).thenReturn("mock-token");

        AuthResponse res = authService.login(req);

        assertNotNull(res);
        assertEquals("mock-token", res.getAccessToken());
    }

    @Test
    void login_Failure_BadCredentials() {
        LoginRequest req = new LoginRequest();
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Invalid"));

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        UserResponse res = authService.getUserById(1L);
        assertNotNull(res);
        assertEquals("test@example.com", res.getEmail());
    }

    @Test
    void getUserById_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> authService.getUserById(1L));
    }

    @Test
    void getAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(mockUser));
        List<UserResponse> res = authService.getAllUsers();
        assertEquals(1, res.size());
    }

    @Test
    void toggleUserStatus() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        ApiResponse res = authService.toggleUserStatus(1L);
        assertNotNull(res);
        assertFalse(mockUser.isActive()); // Toggled from true
    }

    @Test
    void requestPasswordReset_Success() {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        ApiResponse res = authService.requestPasswordReset(req);

        assertTrue(res.isSuccess());
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    void resetPassword_Success() {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setToken("token-123");
        req.setNewPassword("new-pass");

        PasswordResetToken tokenEntity = PasswordResetToken.builder()
                .token("token-123")
                .user(mockUser)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .build();

        when(tokenRepository.findByToken("token-123")).thenReturn(Optional.of(tokenEntity));
        when(passwordEncoder.encode("new-pass")).thenReturn("encoded-new-pass");

        ApiResponse res = authService.resetPassword(req);

        assertTrue(res.isSuccess());
        assertEquals("encoded-new-pass", mockUser.getPassword());
        verify(tokenRepository).delete(tokenEntity);
    }

    @Test
    void resetPassword_Expired() {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setToken("token-expired");

        PasswordResetToken tokenEntity = PasswordResetToken.builder()
                .token("token-expired")
                .user(mockUser)
                .expiryDate(LocalDateTime.now().minusHours(1))
                .build();

        when(tokenRepository.findByToken("token-expired")).thenReturn(Optional.of(tokenEntity));

        assertThrows(RuntimeException.class, () -> authService.resetPassword(req));
    }

    @Test
    void verifyOtp_Success() {
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("test@example.com");
        req.setOtp("123456");

        mockUser.setOtp("123456");
        mockUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(jwtUtil.generateToken(mockUser)).thenReturn("token");

        AuthResponse res = authService.verifyOtp(req);

        assertNotNull(res);
        assertTrue(mockUser.isEmailVerified());
        assertNull(mockUser.getOtp());
        verify(emailService).sendWelcomeEmail(anyString(), anyString());
    }

    @Test
    void verifyOtp_Invalid() {
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("test@example.com");
        req.setOtp("wrong");

        mockUser.setOtp("123456");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        assertThrows(InvalidOtpException.class, () -> authService.verifyOtp(req));
    }

    @Test
    void verifyOtp_Expired() {
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("test@example.com");
        req.setOtp("123456");

        mockUser.setOtp("123456");
        mockUser.setOtpExpiry(LocalDateTime.now().minusMinutes(5));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        assertThrows(InvalidOtpException.class, () -> authService.verifyOtp(req));
    }

    @Test
    void sendOtp_Success() {
        SendOtpRequest req = new SendOtpRequest();
        req.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        ApiResponse res = authService.sendOtp(req);

        assertTrue(res.isSuccess());
        assertNotNull(mockUser.getOtp());
        assertNotNull(mockUser.getOtpExpiry());
        verify(emailService).sendVerificationEmail(eq("test@example.com"), anyString());
    }
}
