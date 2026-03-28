package com.nexus.auth.dto;

import com.nexus.auth.entity.Role;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DtoTest {
    @Test
    void testAuthDtos() {
        AuthDtos.RegisterRequest reg = new AuthDtos.RegisterRequest();
        reg.setName("N"); reg.setEmail("E"); reg.setPassword("P"); reg.setRole(Role.ADMIN); reg.setPhone("1");
        assertEquals("N", reg.getName());
        assertEquals("E", reg.getEmail());
        assertEquals("P", reg.getPassword());
        assertEquals(Role.ADMIN, reg.getRole());
        assertEquals("1", reg.getPhone());

        AuthDtos.LoginRequest log = new AuthDtos.LoginRequest();
        log.setEmail("E"); log.setPassword("P");
        assertEquals("E", log.getEmail());
        assertEquals("P", log.getPassword());

        AuthDtos.ForgotPasswordRequest fp = new AuthDtos.ForgotPasswordRequest();
        fp.setEmail("E");
        assertEquals("E", fp.getEmail());

        AuthDtos.ResetPasswordRequest rp = new AuthDtos.ResetPasswordRequest();
        rp.setToken("T"); rp.setNewPassword("P");
        assertEquals("T", rp.getToken());
        assertEquals("P", rp.getNewPassword());

        AuthDtos.AuthResponse ar = new AuthDtos.AuthResponse("T", 1L, "N", "E", "R");
        ar.setAccessToken("T2"); ar.setTokenType("B"); ar.setUserId(2L); ar.setName("N2"); ar.setEmail("E2"); ar.setRole("R2");
        assertEquals("T2", ar.getAccessToken());
        assertEquals("B", ar.getTokenType());
        assertEquals(2L, ar.getUserId());
        assertEquals("N2", ar.getName());
        assertEquals("E2", ar.getEmail());
        assertEquals("R2", ar.getRole());

        AuthDtos.UserResponse ur = new AuthDtos.UserResponse();
        ur.setId(1L); ur.setName("N"); ur.setEmail("E"); ur.setRole(Role.ADMIN.name()); ur.setPhone("1"); ur.setActive(true); ur.setCreatedAt("C");
        assertEquals(1L, ur.getId());
        assertEquals("N", ur.getName());
        assertEquals("E", ur.getEmail());
        assertEquals(Role.ADMIN.name(), ur.getRole());
        assertEquals("1", ur.getPhone());
        assertTrue(ur.isActive());
        assertEquals("C", ur.getCreatedAt());

        AuthDtos.ApiResponse api = new AuthDtos.ApiResponse(true, "M");
        api.setSuccess(false); api.setMessage("M2");
        assertFalse(api.isSuccess());
        assertEquals("M2", api.getMessage());
    }
}
