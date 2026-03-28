package com.nexus.application.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * REST controller for file uploads using Cloudinary.
 * Stores resumes securely in the cloud for global access.
 */
@RestController
@RequestMapping("/api/applications")
public class FileUploadController {

    private final Cloudinary cloudinary;

    public FileUploadController(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadResume(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please select a file to upload"));
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                    ObjectUtils.asMap(
                        "resource_type", "auto",
                        "folder", "resumes"
                    ));
            
            // Get the secure CDN URL
            String fileUrl = (String) uploadResult.get("secure_url");
            
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cloud upload failed: " + ex.getMessage()));
        }
    }

}
