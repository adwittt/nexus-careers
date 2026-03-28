package com.nexus.auth.service;

import com.nexus.auth.dto.AuthDtos.*;
import com.nexus.auth.entity.PasswordResetToken;
import com.nexus.auth.entity.User;
import com.nexus.auth.exception.ResourceAlreadyExistsException;
import com.nexus.auth.repository.PasswordResetTokenRepository;
import com.nexus.auth.repository.UserRepository;
import com.nexus.auth.security.JwtUtil;
import java.time.LocalDateTime;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Core authentication service: handles registration, login, user management.
 */
@Service
@Transactional
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, 
                      AuthenticationManager authenticationManager, PasswordResetTokenRepository tokenRepository, 
                      EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }



    /**
     * Register a new user. Throws if email already in use.
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {} [{}]", saved.getEmail(), saved.getRole());

        String accessToken = jwtUtil.generateToken(saved);
        return new AuthResponse(accessToken, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name());
    }

    /**
     * Authenticate user and return JWT token.
     */
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = (User) auth.getPrincipal();
            String accessToken = jwtUtil.generateToken(user);
            log.info("User logged in: {}", user.getEmail());

            return new AuthResponse(accessToken, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    /**
     * Get user profile by ID.
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    /**
     * Get all users (Admin only).
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Toggle user active status (Admin only).
     */
    public ApiResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
        String status = user.isActive() ? "activated" : "deactivated";
        return new ApiResponse(true, "User " + status + " successfully");
    }

    public ApiResponse requestPasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        
        if (user == null) {
            log.warn("Password reset requested for non-existent email: {}", request.getEmail());
            return new ApiResponse(false, "User not found with email: " + request.getEmail());
        }

        String tokenStr = UUID.randomUUID().toString();
        
        PasswordResetToken token = PasswordResetToken.builder()
                .token(tokenStr)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .build();
                
        tokenRepository.save(token);

        String resetLink = "http://localhost:3000/reset-password?token=" + tokenStr;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);

        return new ApiResponse(true, "Password reset link sent to your email");
    }

    public ApiResponse resetPassword(ResetPasswordRequest request) {
        PasswordResetToken tokenEntity = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (tokenEntity.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        User user = tokenEntity.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.delete(tokenEntity);

        return new ApiResponse(true, "Password successfully reset");
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setPhone(user.getPhone());
        response.setActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return response;
    }
}
