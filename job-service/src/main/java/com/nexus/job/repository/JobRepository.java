package com.nexus.job.repository;

import com.nexus.job.entity.Job;
import com.nexus.job.entity.JobType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Job entity - includes dynamic search query.
 */
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    /**
     * Get all active jobs. Non-expired jobs come first, expired jobs at the end.
     */
    @Query("SELECT j FROM Job j WHERE j.isActive = true ORDER BY CASE WHEN j.applicationDeadline IS NOT NULL AND j.applicationDeadline < CURRENT_TIMESTAMP THEN 1 ELSE 0 END ASC, j.createdAt DESC")
    List<Job> findAllActiveJobsSorted();

    /**
     * Dynamic search with optional filters.
     * All parameters are optional - null values are ignored.
     * Non-expired jobs come first, expired jobs at the end.
     */
    @Query("""
        SELECT DISTINCT j FROM Job j
        WHERE j.isActive = true
        AND (:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:jobType IS NULL OR j.jobType = :jobType)
        AND (:experience IS NULL OR LOWER(j.experience) LIKE LOWER(CONCAT('%', :experience, '%')))
        AND (:salary IS NULL OR LOWER(j.salary) LIKE LOWER(CONCAT('%', :salary, '%')))
        ORDER BY CASE WHEN j.applicationDeadline IS NOT NULL AND j.applicationDeadline < CURRENT_TIMESTAMP THEN 1 ELSE 0 END ASC, j.createdAt DESC
    """)
     List<Job> searchJobs(
            @Param("title") String title,
            @Param("location") String location,
            @Param("jobType") JobType jobType,
            @Param("experience") String experience,
            @Param("salary") String salary
    );

    List<Job> findByPostedByAndIsActiveTrueOrderByCreatedAtDesc(Long postedBy);

    long countByIsActiveTrue();

    long countByPostedBy(Long postedBy);
}
