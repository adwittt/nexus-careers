package com.nexus.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    public void sendPasswordResetEmail(String to, String resetLink) {
        log.info("==================================================");
        log.info("Mock Email Sent to: {}", to);
        log.info("Subject: Password Reset Request");
        log.info("Body: Click the following link to reset your password: {}", resetLink);
        log.info("==================================================");
    }
}
