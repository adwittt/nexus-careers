package com.nexus.auth.security;

import com.nexus.auth.entity.User;
import com.nexus.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2LoginSuccessHandlerTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtUtil jwtUtil;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private Authentication authentication;
    @Mock private OAuth2User oAuth2User;
    @Mock private org.springframework.security.web.RedirectStrategy redirectStrategy;

    @InjectMocks private OAuth2LoginSuccessHandler handler;

    @Test
    void onAuthenticationSuccess_ExistingUserSuccess() throws Exception {
        handler.setRedirectStrategy(redirectStrategy);
        when(authentication.getPrincipal()).thenReturn(oAuth2User);
        when(oAuth2User.getAttribute("email")).thenReturn("existing@test.com");
        when(oAuth2User.getAttribute("name")).thenReturn("Existing User");
        
        User user = User.builder().email("existing@test.com").name("Existing User").build();
        when(userRepository.findByEmail("existing@test.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(any())).thenReturn("token");

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(redirectStrategy).sendRedirect(eq(request), eq(response), contains("token=token"));
    }

    @Test
    void onAuthenticationSuccess_NewUserSuccess() throws Exception {
        handler.setRedirectStrategy(redirectStrategy);
        when(authentication.getPrincipal()).thenReturn(oAuth2User);
        when(oAuth2User.getAttribute("email")).thenReturn("new@test.com");
        when(oAuth2User.getAttribute("name")).thenReturn(null);
        when(oAuth2User.getAttribute("localizedFirstName")).thenReturn("New");
        when(oAuth2User.getAttribute("localizedLastName")).thenReturn("User");
        when(request.getRequestURI()).thenReturn("/login/oauth2/code/google");
        
        when(userRepository.findByEmail("new@test.com")).thenReturn(Optional.empty());
        when(jwtUtil.generateToken(any())).thenReturn("token");

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(userRepository).save(any(User.class));
        verify(redirectStrategy).sendRedirect(eq(request), eq(response), contains("token=token"));
    }

    @Test
    void onAuthenticationSuccess_NoEmail_RedirectsWithError() throws Exception {
        when(authentication.getPrincipal()).thenReturn(oAuth2User);
        when(oAuth2User.getAttribute("email")).thenReturn(null);

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(response).sendRedirect(contains("error=email_not_found"));
    }
}
