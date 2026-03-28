package com.nexus.application.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "job-service", path = "/api/jobs")
public interface JobServiceClient {
    
    @GetMapping("/{id}")
    JobDto getJobById(@PathVariable("id") Long id);
}
