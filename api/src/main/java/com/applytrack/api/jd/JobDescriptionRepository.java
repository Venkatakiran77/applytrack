package com.applytrack.api.jd;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface JobDescriptionRepository extends MongoRepository<JobDescriptionDoc, String> {
    Optional<JobDescriptionDoc> findByApplicationId(Long applicationId);
}