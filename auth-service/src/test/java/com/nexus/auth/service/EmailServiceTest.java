package com.nexus.auth.service;

import org.junit.jupiter.api.Test;

class EmailServiceTest {
    @Test
    void testSendEmail() {
        new EmailService().sendPasswordResetEmail("test@test.com", "http://reset");
    }
}
