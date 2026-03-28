package com.nexus.job.repository;

import com.nexus.job.entity.Job;
import com.nexus.job.entity.JobType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class JobRepositoryTest {

    @Autowired
    private JobRepository jobRepository;

    @Test
    void testSearchJobs() {
        Job job = Job.builder()
                .title("Software Engineer")
                .companyName("Nexus")
                .location("Online")
                .jobType(JobType.REMOTE)
                .isActive(true)
                .build();
        jobRepository.save(job);

        List<Job> results = jobRepository.searchJobs("Software", "Online", JobType.REMOTE, null);
        assertFalse(results.isEmpty());
        assertEquals("Software Engineer", results.get(0).getTitle());
    }

    @Test
    void testCountByIsActiveTrue() {
        Job job = Job.builder().title("T").companyName("C").location("L").jobType(JobType.FULL_TIME).isActive(true).build();
        jobRepository.save(job);
        assertEquals(1, jobRepository.countByIsActiveTrue());
    }
}
