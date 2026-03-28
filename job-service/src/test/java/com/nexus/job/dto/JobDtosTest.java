package com.nexus.job.dto;
import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JobDtosTest {
    @Test
    void testJobDtos() {
        JobDtos.CreateJobRequest create = new JobDtos.CreateJobRequest();
        create.setTitle("T"); create.setCompanyName("C"); create.setLocation("L"); create.setSalary("S");
        assertEquals("T", create.getTitle());

        JobDtos.UpdateJobRequest update = new JobDtos.UpdateJobRequest();
        update.setTitle("T");
        assertEquals("T", update.getTitle());

        JobDtos.JobResponse response = new JobDtos.JobResponse();
        response.setId(1L); response.setTitle("T"); response.setActive(true);
        assertEquals(1L, response.getId());
        assertTrue(response.isActive());

        JobDtos.ApiResponse api = new JobDtos.ApiResponse(true, "M");
        assertTrue(api.isSuccess());
    }
}
