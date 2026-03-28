package com.nexus.auth.security;

import com.nexus.auth.entity.AuthProvider;
import com.nexus.auth.entity.Role;
import com.nexus.auth.entity.User;
import com.nexus.auth.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OAuth2LoginSuccessHandler(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        if (name == null) {
            String firstName = oAuth2User.getAttribute("localizedFirstName");
            String lastName = oAuth2User.getAttribute("localizedLastName");
            if (firstName != null && lastName != null) {
                name = firstName + " " + lastName;
            }
        }

        if (email == null) {
            log.error("OAuth2 user email is null");
            response.sendRedirect("http://localhost:3000/login?error=email_not_found");
            return;
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            AuthProvider provider = request.getRequestURI().contains("google") ? AuthProvider.GOOGLE : AuthProvider.LINKEDIN;
            
            user = User.builder()
                    .name(name != null ? name : email.split("@")[0])
                    .email(email)
                    .password("") // no local password
                    .role(Role.JOB_SEEKER) // Default role for OAuth users
                    .authProvider(provider)
                    .isActive(true)
                    .build();
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user);
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth2/redirect")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
