package com.knowledgehub.tag;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Tag} entities.
 *
 * <p>All queries are user-scoped. The service layer is responsible for
 * passing the authenticated user's ID.</p>
 */
@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    /** All tags belonging to a user, ordered alphabetically. */
    List<Tag> findByUserIdOrderByNameAsc(Long userId);

    /**
     * Find a tag by name for a specific user.
     * Used by the service layer to implement "create if not exists" logic:
     * if the tag already exists, reuse it; otherwise create it.
     */
    Optional<Tag> findByUserIdAndName(Long userId, String name);

    /** Find a tag by ID and user ID for ownership validation. */
    Optional<Tag> findByIdAndUserId(Long id, Long userId);

    /** Check whether a tag name already exists for a given user. */
    boolean existsByUserIdAndName(Long userId, String name);
}
