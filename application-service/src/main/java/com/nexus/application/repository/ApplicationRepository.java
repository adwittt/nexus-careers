package com.nexus.application.repository;

import com.nexus.application.entity.Application;
import com.nexus.application.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Application entity operations.
 */
@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    /** All applications by a specific job seeker */
    List<Application> findByUserIdOrderByAppliedAtDesc(Long userId);

    /** All applications for a specific job posting */
    List<Application> findByJobIdOrderByAppliedAtDesc(Long jobId);

    /** Check duplicate application */
    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    /** Find specific application by user + job */
    Optional<Application> findByUserIdAndJobId(Long userId, Long jobId);

    /** Count by status for analytics */
    long countByStatus(ApplicationStatus status);

    /** Status breakdown for admin reports */
    @Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    List<Object[]> countGroupedByStatus();

    /** Total application count */
    long count();

    /** Applications by company (for recruiter stats) */
    List<Application> findByCompanyNameOrderByAppliedAtDesc(String companyName);
}
