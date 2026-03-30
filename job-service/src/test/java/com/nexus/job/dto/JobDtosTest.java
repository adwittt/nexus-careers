package com.nexus.job.dto;

import org.junit.jupiter.api.Test;
import com.nexus.job.entity.JobType;
import static org.junit.jupiter.api.Assertions.*;

class JobDtosTest {

    @Test
    void testCreateJobRequest() {
        JobDtos.CreateJobRequest req = new JobDtos.CreateJobRequest();
        req.setTitle("Software Engineer");
        req.setCompanyName("Nexus Tech");
        req.setLocation("San Francisco, CA");
        req.setSalary("$120,000 - $150,000");
        req.setExperience("2+ years");
        req.setDescription("Join our team to build the future of career networking.");
        req.setJobType(JobType.FULL_TIME);

        assertEquals("Software Engineer", req.getTitle());
        assertEquals("Nexus Tech", req.getCompanyName());
        assertEquals("San Francisco, CA", req.getLocation());
        assertEquals("$120,000 - $150,000", req.getSalary());
        assertEquals("2+ years", req.getExperience());
        assertEquals("Join our team to build the future of career networking.", req.getDescription());
        assertEquals(JobType.FULL_TIME, req.getJobType());
    }

    @Test
    void testUpdateJobRequest() {
        JobDtos.UpdateJobRequest req = new JobDtos.UpdateJobRequest();
        req.setTitle("Senior Dev");
        req.setCompanyName("Nexus Innovations");
        req.setLocation("Remote");
        req.setSalary("$180,000");
        req.setExperience("5+ years");
        req.setDescription("Lead our core services team and scale the platform.");
        req.setJobType(JobType.CONTRACT);

        assertEquals("Senior Dev", req.getTitle());
        assertEquals("Nexus Innovations", req.getCompanyName());
        assertEquals("Remote", req.getLocation());
        assertEquals("$180,000", req.getSalary());
        assertEquals("5+ years", req.getExperience());
        assertEquals("Lead our core services team and scale the platform.", req.getDescription());
        assertEquals(JobType.CONTRACT, req.getJobType());
    }

    @Test
    void testJobResponse() {
        JobDtos.JobResponse res = new JobDtos.JobResponse();
        res.setId(1L);
        res.setTitle("Title");
        res.setCompanyName("Company");
        res.setLocation("Location");
        res.setSalary("Salary");
        res.setExperience("Experience");
        res.setDescription("Description");
        res.setJobType(JobType.PART_TIME.name());
        res.setActive(true);
        res.setPostedBy(100L);
        res.setRecruiterName("Recruiter");
        res.setCreatedAt("date");

        assertEquals(1L, res.getId());
        assertEquals("Title", res.getTitle());
        assertEquals("Company", res.getCompanyName());
        assertEquals("Location", res.getLocation());
        assertEquals("Salary", res.getSalary());
        assertEquals("Experience", res.getExperience());
        assertEquals("Description", res.getDescription());
        assertEquals(JobType.PART_TIME.name(), res.getJobType());
        assertTrue(res.isActive());
        assertEquals(100L, res.getPostedBy());
        assertEquals("Recruiter", res.getRecruiterName());
        assertEquals("date", res.getCreatedAt());
    }

    @Test
    void testApiResponse() {
        JobDtos.ApiResponse res = new JobDtos.ApiResponse(true, "Success");
        assertTrue(res.isSuccess());
        assertEquals("Success", res.getMessage());

        res.setSuccess(false);
        res.setMessage("Fail");
        assertFalse(res.isSuccess());
        assertEquals("Fail", res.getMessage());

        JobDtos.ApiResponse empty = new JobDtos.ApiResponse();
        assertNotNull(empty);
    }
}
