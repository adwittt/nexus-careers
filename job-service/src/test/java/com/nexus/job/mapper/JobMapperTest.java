package com.nexus.job.mapper;

import com.nexus.job.dto.JobDtos.JobResponse;
import com.nexus.job.entity.Job;
import com.nexus.job.entity.JobType;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class JobMapperTest {
    private final JobMapper mapper = new JobMapper();

    @Test
    void testToResponse() {
        Job job = Job.builder()
                .id(1L)
                .title("T")
                .companyName("C")
                .location("L")
                .salary("S")
                .experience("E")
                .description("D")
                .requiredSkills(List.of("S1"))
                .jobType(JobType.FULL_TIME)
                .postedBy(2L)
                .recruiterName("RN")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        JobResponse res = mapper.toResponse(job);
        assertNotNull(res);
        assertEquals("T", res.getTitle());
        assertEquals("FULL_TIME", res.getJobType());
        assertEquals("RN", res.getRecruiterName());
    }

    @Test
    void testToResponse_NullValues() {
        Job job = new Job();
        job.setJobType(null);
        JobResponse res = mapper.toResponse(job);
        assertNull(res.getJobType()); 
    }
}
