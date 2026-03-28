package com.nexus.auth.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void testHandleResourceAlreadyExists() {
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = 
            handler.handleResourceAlreadyExists(new ResourceAlreadyExistsException("Conflict"));
        assertEquals(HttpStatus.CONFLICT, resp.getStatusCode());
        assertEquals("Conflict", resp.getBody().message());
    }

    @Test
    void testHandleResourceNotFound() {
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = 
            handler.handleResourceNotFound(new ResourceNotFoundException("Not Found"));
        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
        assertEquals("Not Found", resp.getBody().message());
    }

    @Test
    void testHandleBadCredentials() {
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = 
            handler.handleBadCredentials(new BadCredentialsException("Failed"));
        assertEquals(HttpStatus.UNAUTHORIZED, resp.getStatusCode());
    }

    @Test
    void testHandleGeneral() {
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> resp = 
            handler.handleGeneral(new Exception("Internal error"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
    }

    @Test
    void testHandleValidation() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("object", "email", "invalid email");
        
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<GlobalExceptionHandler.ValidationErrorResponse> resp = handler.handleValidation(ex);
        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertTrue(resp.getBody().errors().containsKey("email"));
    }
}
