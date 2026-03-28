package com.nexus.job.controller;

import com.nexus.job.service.JobCommandService;
import com.nexus.job.service.JobQueryService;
import com.nexus.job.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(JobController.class)
@AutoConfigureMockMvc(addFilters = false) // Disabling core security filters, testing raw @PreAuthorize via method security
class JobControllerSecurityTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private JobCommandService jobCommandService;
    @MockBean private JobQueryService jobQueryService;
    @MockBean private JwtUtil jwtUtil;

    @Test
    void testGetAllJobs_IsPublic() throws Exception {
        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "JOB_SEEKER")
    void testCreateJob_WithWrongRole_IsForbidden() throws Exception {
    }
}
