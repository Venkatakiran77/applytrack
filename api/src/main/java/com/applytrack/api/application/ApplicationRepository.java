package com.applytrack.api.application;

import com.applytrack.api.dashboard.dto.ResumeCount;
import com.applytrack.api.user.User;
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

    boolean existsByResume(com.applytrack.api.resume.Resume resume); // Used to block deleting a resume in use

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
       select new com.applytrack.api.dashboard.dto.ResumeCount(
           r.name, count(a), sum(case when a.status in :responded then 1L else 0L end))
       from JobApplication a join a.resume r
       where a.user = :user
       group by r.id, r.name
       order by r.name
       """)
    List<ResumeCount> resumeStats(@Param("user") User user,
                                  @Param("responded") Collection<ApplicationStatus> responded);
}