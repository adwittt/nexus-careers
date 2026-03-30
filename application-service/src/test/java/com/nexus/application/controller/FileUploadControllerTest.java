package com.nexus.application.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FileUploadController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = {
    "cloudinary.cloud-name=test",
    "cloudinary.api-key=test",
    "cloudinary.api-secret=test"
})
class FileUploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.nexus.application.security.JwtUtil jwtUtil;

    @Test
    void uploadResume_EmptyFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "", "text/plain", "".getBytes());
        mockMvc.perform(multipart("/api/applications/upload").file(file))
                .andExpect(status().isBadRequest());
    }
}
