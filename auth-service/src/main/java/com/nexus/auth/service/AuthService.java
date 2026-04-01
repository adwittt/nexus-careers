package com.nexus.auth.service;

import com.nexus.auth.dto.AuthDtos.*;
import com.nexus.auth.entity.PasswordResetToken;
import com.nexus.auth.entity.User;
import com.nexus.auth.exception.ResourceAlreadyExistsException;
import com.nexus.auth.repository.PasswordResetTokenRepository;
import com.nexus.auth.repository.UserRepository;
import com.nexus.auth.security.JwtUtil;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.nexus.auth.exception.InvalidOtpException;
import com.nexus.auth.exception.ResourceNotFoundException;
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
    private static final String USER_NOT_FOUND_EMAIL = "User not found with email: ";
    private static final SecureRandom secureRandom = new SecureRandom();

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

        String otp = String.format("%06d", secureRandom.nextInt(999999));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .companyName(request.getCompanyName())
                .build();

        user.setEmailVerified(false);
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));

        User saved = userRepository.save(user);
        log.info("New user registered: {} [{}]", saved.getEmail(), saved.getRole());

        emailService.sendVerificationEmail(saved.getEmail(), otp);

        // Return null token because they need to verify via OTP first
        return new AuthResponse(null, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name());
    }

    /**
     * Authenticate user and return JWT token.
     */
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            User user = (User) auth.getPrincipal();

            if (!user.isEmailVerified()) {
                throw new RuntimeException(
                        "Please verify your email address before logging in. An OTP was sent during registration.");
            }

            String accessToken = jwtUtil.generateToken(user);
            log.info("User logged in: {}", user.getEmail());

            return new AuthResponse(accessToken, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_EMAIL + request.getEmail()));

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new InvalidOtpException("Invalid OTP");
        }
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidOtpException("OTP has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        emailService.sendWelcomeEmail(user.getEmail(), user.getName());

        String accessToken = jwtUtil.generateToken(user);
        return new AuthResponse(accessToken, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public ApiResponse sendOtp(SendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_EMAIL + request.getEmail()));

        String otp = String.format("%06d", secureRandom.nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), otp);
        return new ApiResponse(true, "OTP sent successfully to " + request.getEmail());
    }

    /**
     * Update user profile.
     */
    public UserResponse updateProfile(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        if (request.getCompanyName() != null) {
            user.setCompanyName(request.getCompanyName());
        }
        
        User saved = userRepository.save(user);
        log.info("User profile updated: {}", saved.getEmail());
        return mapToUserResponse(saved);
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
        response.setCompanyName(user.getCompanyName());
        response.setActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return response;
    }
}
