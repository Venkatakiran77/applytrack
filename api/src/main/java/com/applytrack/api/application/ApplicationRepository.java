package com.applytrack.api.application;

import com.applytrack.api.application.dto.Tally;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<JobApplication, Long> {

    Page<JobApplication> findByUserEmail(String email, Pageable pageable);

    Page<JobApplication> findByUserEmailAndStatus(String email, ApplicationStatus status, Pageable pageable);

    Optional<JobApplication> findByIdAndUserEmail(Long id, String email);

    @Modifying
    @Query("""
        update JobApplication a
           set a.followUpNeeded = true
         where a.status in :statuses
           and a.lastUpdated < :cutoff
           and a.followUpNeeded = false
        """)
    int flagStale(@Param("statuses") Collection<ApplicationStatus> statuses,
                  @Param("cutoff") Instant cutoff);

    @Query("""
        select new com.applytrack.api.application.dto.Tally(a.resumeVersion, a.status, count(a))
          from JobApplication a
         where a.user.email = :email
         group by a.resumeVersion, a.status
        """)
    List<Tally> tallyByResumeAndStatus(@Param("email") String email);
}