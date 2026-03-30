package com.nexus.job.mapper;

import com.nexus.job.dto.JobDtos.JobResponse;
import com.nexus.job.entity.Job;
import com.nexus.job.entity.JobType;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class JobMapperTest {

    private final JobMapper mapper = new JobMapper();

    @Test
    void toResponse_Null() {
        assertNull(mapper.toResponse(null));
    }

    @Test
    void toResponse_Full() {
        Job job = Job.builder()
                .id(1L)
                .title("T")
                .companyName("C")
                .location("L")
                .salary("S")
                .experience("E")
                .description("D")
                .jobType(JobType.FULL_TIME)
                .postedBy(100L)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        JobResponse res = mapper.toResponse(job);
        assertEquals(1L, res.getId());
        assertEquals("FULL_TIME", res.getJobType());
        assertTrue(res.isActive());
        assertNotNull(res.getCreatedAt());
        assertNotNull(res.getUpdatedAt());
    }

    @Test
    void toResponse_EmptyJobType() {
        Job job = Job.builder().jobType(null).build();
        JobResponse res = mapper.toResponse(job);
        assertEquals("FULL_TIME", res.getJobType());
    }
}
