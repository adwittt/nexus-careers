package com.nexus.application.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleNotFound_Returns404() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleNotFound(ex);
        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
    }

    @Test
    void handleUnauthorized_Returns403() {
        UnauthorizedException ex = new UnauthorizedException("Unauthorized");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleUnauthorized(ex);
        assertEquals(HttpStatus.FORBIDDEN, resp.getStatusCode());
    }

    @Test
    void handleDuplicate_Returns409() {
        DuplicateApplicationException ex = new DuplicateApplicationException("Duplicate");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleDuplicate(ex);
        assertEquals(HttpStatus.CONFLICT, resp.getStatusCode());
    }

    @Test
    void handleGeneral_Returns500() {
        Exception ex = new Exception("Error");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleGeneral(ex);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
    }

    @Test
    void handleBadArg_Returns400() {
        IllegalArgumentException ex = new IllegalArgumentException("Bad");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleBadArg(ex);
        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    }

    @Test
    void handleIllegalState_Returns422() {
        IllegalStateException ex = new IllegalStateException("Illegal");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = handler.handleIllegalState(ex);
        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, resp.getStatusCode());
    }
}
