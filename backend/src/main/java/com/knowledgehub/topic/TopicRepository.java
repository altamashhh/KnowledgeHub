package com.knowledgehub.topic;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Topic} entities.
 *
 * <p>All query methods are user-scoped. The service layer must always pass
 * {@code userId} from the authenticated JWT principal — never from the
 * request body or path variable.</p>
 */
@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    /** All topics owned by a user, ordered by name. */
    List<Topic> findByUserIdOrderByNameAsc(Long userId);

    /**
     * Find a specific topic by ID AND user ID.
     * Returns empty if the topic doesn't exist OR belongs to another user.
     * This is the correct pattern for per-user data isolation —
     * it returns 404 (not found) regardless of whether the topic
     * exists under a different user.
     */
    Optional<Topic> findByIdAndUserId(Long id, Long userId);

    /** Check whether a topic name is already taken for a given user. */
    boolean existsByUserIdAndName(Long userId, String name);
}
