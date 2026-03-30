package com.nexus.auth.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleResourceNotFound() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> res = handler.handleResourceNotFound(ex);
        assertEquals(HttpStatus.NOT_FOUND, res.getStatusCode());
        assertEquals("Not found", res.getBody().message());
    }

    @Test
    void handleResourceAlreadyExists() {
        ResourceAlreadyExistsException ex = new ResourceAlreadyExistsException("Already exists");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> res = handler.handleResourceAlreadyExists(ex);
        assertEquals(HttpStatus.CONFLICT, res.getStatusCode());
        assertEquals("Already exists", res.getBody().message());
    }

    @Test
    void handleInvalidOtp() {
        InvalidOtpException ex = new InvalidOtpException("Wrong OTP");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> res = handler.handleInvalidOtp(ex);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
        assertEquals("Wrong OTP", res.getBody().message());
    }

    @Test
    void handleBadCredentials() {
        BadCredentialsException ex = new BadCredentialsException("Bad creds");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> res = handler.handleBadCredentials(ex);
        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode());
        assertEquals("Bad creds", res.getBody().message());
    }

    @Test
    void handleGeneralException() {
        Exception ex = new Exception("General fail");
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> res = handler.handleGeneral(ex);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode());
    }

    @Test
    void handleValidation() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("object", "field", "default message");
        
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getAllErrors()).thenReturn(Collections.singletonList(fieldError));

        ResponseEntity<GlobalExceptionHandler.ValidationErrorResponse> res = handler.handleValidation(ex);
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
        assertNotNull(res.getBody().errors());
        assertEquals("default message", res.getBody().errors().get("field"));
    }
}
