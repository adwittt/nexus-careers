package com.nexus.admin.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleRuntime() {
        RuntimeException ex = new RuntimeException("Fail");
        ResponseEntity<Map<String, String>> resp = handler.handleRuntime(ex);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
        assertEquals("Fail", resp.getBody().get("error"));
    }

    @Test
    void handleGeneral() {
        Exception ex = new Exception("Err");
        ResponseEntity<Map<String, String>> resp = handler.handleGeneral(ex);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
    }
}
