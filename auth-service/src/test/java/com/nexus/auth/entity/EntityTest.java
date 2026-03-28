package com.nexus.auth.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class EntityTest {
    @Test
    void testUserEntity() {
        User user = new User();
        user.setId(1L);
        user.setName("Name");
        user.setEmail("email@test.com");
        user.setPassword("pass");
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setProviderId("pid");
        user.setRole(Role.ADMIN);
        user.setPhone("123");
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        assertEquals(1L, user.getId());
        assertEquals("Name", user.getName());
        assertEquals("email@test.com", user.getEmail());
        assertEquals("pass", user.getPassword());
        assertEquals(AuthProvider.LOCAL, user.getAuthProvider());
        assertEquals("pid", user.getProviderId());
        assertEquals(Role.ADMIN, user.getRole());
        assertEquals("123", user.getPhone());
        assertTrue(user.isActive());
        assertNotNull(user.getCreatedAt());
        assertNotNull(user.getAuthorities());
        assertEquals("email@test.com", user.getUsername());
        assertTrue(user.isAccountNonExpired());
        assertTrue(user.isAccountNonLocked());
        assertTrue(user.isCredentialsNonExpired());
        assertTrue(user.isEnabled());
    }

    @Test
    void testPasswordResetToken() {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(1L);
        token.setToken("tok");
        token.setUser(new User());
        token.setExpiryDate(LocalDateTime.now());

        assertEquals(1L, token.getId());
        assertEquals("tok", token.getToken());
        assertNotNull(token.getUser());
        assertNotNull(token.getExpiryDate());
    }

    @Test
    void testUserBuilder() {
        User u = User.builder()
                .id(1L).name("N").email("E").password("P").authProvider(AuthProvider.GOOGLE).providerId("PID").role(Role.ADMIN).phone("123").isActive(true).createdAt(LocalDateTime.now())
                .build();
        assertEquals(1L, u.getId());
    }
}
