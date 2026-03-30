package com.nexus.application.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void testSendStatusUpdateEmail_UnderReview() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        
        emailService.sendStatusUpdateEmail("to@test.com", "User", "Dev", "Nexus", "UNDER_REVIEW");
        
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void testSendStatusUpdateEmail_Shortlisted() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        
        emailService.sendStatusUpdateEmail("to@test.com", "User", "Dev", "Nexus", "SHORTLISTED");
        
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void testSendStatusUpdateEmail_Rejected() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        
        emailService.sendStatusUpdateEmail("to@test.com", "User", "Dev", "Nexus", "REJECTED");
        
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void testSendStatusUpdateEmail_Other() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        
        emailService.sendStatusUpdateEmail("to@test.com", "User", "Dev", "Nexus", "PENDING");
        
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void testSendStatusUpdateEmail_NoMailSender() {
        ReflectionTestUtils.setField(emailService, "mailSender", null);
        
        emailService.sendStatusUpdateEmail("to@test.com", "User", "Dev", "Nexus", "UNDER_REVIEW");
        
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void testSendStatusUpdateEmail_Exception() {
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Fail"));
        
        emailService.sendStatusUpdateEmail("to@test.com", "User", "Dev", "Nexus", "UNDER_REVIEW");
        
        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
