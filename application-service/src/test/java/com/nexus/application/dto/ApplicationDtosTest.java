package com.nexus.application.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ApplicationDtosTest {

    @Test
    void testApplyRequest() {
        ApplicationDtos.ApplyRequest req = new ApplicationDtos.ApplyRequest();
        req.setJobId(1L);
        req.setJobTitle("Title");
        req.setCompanyName("Company");
        req.setResumeUrl("url");
        req.setCoverLetter("letter");

        assertEquals(1L, req.getJobId());
        assertEquals("Title", req.getJobTitle());
        assertEquals("Company", req.getCompanyName());
        assertEquals("url", req.getResumeUrl());
        assertEquals("letter", req.getCoverLetter());
    }

    @Test
    void testUpdateStatusRequest() {
        ApplicationDtos.UpdateStatusRequest req = new ApplicationDtos.UpdateStatusRequest();
        req.setStatus("SHORTLISTED");
        req.setRecruiterNotes("notes");

        assertEquals("SHORTLISTED", req.getStatus());
        assertEquals("notes", req.getRecruiterNotes());
    }

    @Test
    void testApplicationResponse() {
        ApplicationDtos.ApplicationResponse res = new ApplicationDtos.ApplicationResponse();
        res.setId(1L);
        res.setUserId(100L);
        res.setJobId(500L);
        res.setApplicantName("Name");
        res.setApplicantEmail("Email");
        res.setJobTitle("Job");
        res.setCompanyName("Company");
        res.setResumeUrl("url");
        res.setCoverLetter("letter");
        res.setStatus("APPLIED");
        res.setRecruiterNotes("notes");
        res.setAppliedAt("now");
        res.setUpdatedAt("later");

        assertEquals(1L, res.getId());
        assertEquals(100L, res.getUserId());
        assertEquals(500L, res.getJobId());
        assertEquals("Name", res.getApplicantName());
        assertEquals("Email", res.getApplicantEmail());
        assertEquals("Job", res.getJobTitle());
        assertEquals("Company", res.getCompanyName());
        assertEquals("url", res.getResumeUrl());
        assertEquals("letter", res.getCoverLetter());
        assertEquals("APPLIED", res.getStatus());
        assertEquals("notes", res.getRecruiterNotes());
        assertEquals("now", res.getAppliedAt());
        assertEquals("later", res.getUpdatedAt());
    }

    @Test
    void testApiResponse() {
        ApplicationDtos.ApiResponse res = new ApplicationDtos.ApiResponse(true, "Msg");
        assertTrue(res.isSuccess());
        assertEquals("Msg", res.getMessage());

        ApplicationDtos.ApiResponse empty = new ApplicationDtos.ApiResponse();
        empty.setSuccess(false);
        empty.setMessage("Fail");
        assertFalse(empty.isSuccess());
        assertEquals("Fail", empty.getMessage());
    }

    @Test
    void testStatusCountResponse() {
        ApplicationDtos.StatusCountResponse res = new ApplicationDtos.StatusCountResponse();
        res.setApplied(10);
        res.setUnderReview(5);
        res.setShortlisted(2);
        res.setRejected(3);
        res.setTotal(20);

        assertEquals(10, res.getApplied());
        assertEquals(5, res.getUnderReview());
        assertEquals(2, res.getShortlisted());
        assertEquals(3, res.getRejected());
        assertEquals(20, res.getTotal());
    }
}
