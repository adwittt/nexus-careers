package com.nexus.application.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ExceptionTests {

    @Test
    void testDuplicateApplicationException() {
        DuplicateApplicationException ex = new DuplicateApplicationException("Duplicate");
        assertEquals("Duplicate", ex.getMessage());
    }

    @Test
    void testResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not Found");
        assertEquals("Not Found", ex.getMessage());
    }

    @Test
    void testUnauthorizedException() {
        UnauthorizedException ex = new UnauthorizedException("Unauthorized");
        assertEquals("Unauthorized", ex.getMessage());
    }
}
