package com.nexus.auth.service;

import com.nexus.auth.entity.User;
import com.nexus.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void loadUserByUsername_Success() {
        User user = User.builder().email("test@test.com").password("pass").build();
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        UserDetails res = userDetailsService.loadUserByUsername("test@test.com");
        assertNotNull(res);
        assertEquals("test@test.com", res.getUsername());
    }

    @Test
    void loadUserByUsername_NotFound() {
        when(userRepository.findByEmail("none")).thenReturn(Optional.empty());
        assertThrows(UsernameNotFoundException.class, () -> userDetailsService.loadUserByUsername("none"));
    }
}
