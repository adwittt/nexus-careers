package com.nexus.job.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class JobEntityTest {
    @Test
    void testJobEntity() {
        Job job = new Job();
        job.setId(1L);
        job.setTitle("T");
        job.setCompanyName("C");
        job.setLocation("L");
        job.setSalary("S");
        job.setExperience("E");
        job.setDescription("D");
        job.setRequiredSkills(List.of("S1"));
        job.setJobType(JobType.FULL_TIME);
        job.setPostedBy(1L);
        job.setRecruiterName("RN");
        job.setActive(true);
        job.setCreatedAt(LocalDateTime.now());
        job.setUpdatedAt(LocalDateTime.now());

        assertEquals(1L, job.getId());
        assertEquals("T", job.getTitle());
        assertEquals("C", job.getCompanyName());
        assertEquals("L", job.getLocation());
        assertEquals("S", job.getSalary());
        assertEquals("E", job.getExperience());
        assertEquals("D", job.getDescription());
        assertEquals(1, job.getRequiredSkills().size());
        assertEquals(JobType.FULL_TIME, job.getJobType());
        assertEquals(1L, job.getPostedBy());
        assertEquals("RN", job.getRecruiterName());
        assertTrue(job.isActive());
        assertNotNull(job.getCreatedAt());
        assertNotNull(job.getUpdatedAt());
    }

    @Test
    void testJobBuilder() {
        Job job = Job.builder()
                .id(1L).title("T").companyName("C").location("L").salary("S").experience("E").description("D").requiredSkills(List.of("S")).jobType(JobType.CONTRACT).postedBy(1L).recruiterName("RN").isActive(false).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();
        assertEquals("T", job.getTitle());
        assertFalse(job.isActive());
    }

    @Test
    void testJobTypeEnum() {
        for (JobType type : JobType.values()) {
            assertNotNull(JobType.valueOf(type.name()));
        }
    }
}
