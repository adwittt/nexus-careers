package com.nexus.application.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendStatusUpdateEmail(String to, String applicantName, String jobTitle, String companyName, String newStatus) {
        String subject = "Nexus Careers - Application Status Update";
        
        String statusMessage = "";
        switch (newStatus.toUpperCase()) {
            case "UNDER_REVIEW":
                statusMessage = "is currently <strong style=\"color:#f39c12;\">Under Review</strong>";
                break;
            case "SHORTLISTED":
                statusMessage = "has been <strong style=\"color:#27ae60;\">Shortlisted</strong> for the next round";
                break;
            case "REJECTED":
                statusMessage = "has been <strong style=\"color:#c0392b;\">Rejected</strong>. Keep applying, don't give up!";
                break;
            default:
                statusMessage = "status has been updated to: <strong>" + newStatus + "</strong>";
        }

        String body = "<h1>Hello " + applicantName + ",</h1>" +
                      "<p>Your application for <strong>" + jobTitle + "</strong> at <strong>" + companyName + "</strong> " + statusMessage + ".</p>" +
                      "<p>Best Regards,<br/>Nexus Careers Team</p>";
                      
        sendHtmlEmail(to, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. Falling back to Mock Email.");
            log.info("Mock Email to: {} | Subject: {} | Body: {}", to, subject, htmlBody);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            helper.setFrom("adwitkumar86@gmail.com");

            mailSender.send(message);
            log.info("Successfully sent email to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {} (MessagingException)", to, e);
        } catch (Exception e) {
            log.error("Failed to send email to {} (General Exception).", to, e);
        }
    }
}
