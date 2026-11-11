package com.knowledgehub.knowledge;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link KnowledgeItem} entities.
 *
 * <p>Extends {@link JpaSpecificationExecutor} to support dynamic filter
 * composition via the JPA Criteria API (Specification pattern).
 * This is the mechanism used by {@code SearchService} to combine
 * keyword search, status filter, type filter, topic filter, and
 * difficulty filter at runtime without 2^N query methods.</p>
 *
 * <p>All query methods include {@code userId} to enforce per-user data
 * isolation. Using {@code findByIdAndUserId} returns empty (→ 404)
 * instead of 403, preventing resource enumeration via sequential IDs.</p>
 */
@Repository
public interface KnowledgeItemRepository
        extends JpaRepository<KnowledgeItem, Long>, JpaSpecificationExecutor<KnowledgeItem> {

    /**
     * Retrieve a knowledge item by its ID only if it belongs to the given user.
     * Returns empty if the item does not exist OR belongs to another user.
     * Callers map empty to 404 — this prevents revealing whether the ID
     * exists under a different user.
     */
    Optional<KnowledgeItem> findByIdAndUserId(Long id, Long userId);

    /**
     * Retrieve a paginated list of knowledge items belonging to the given user.
     */
    Page<KnowledgeItem> findByUserId(Long userId, Pageable pageable);

    /** Count items by status for a given user — used in dashboard stats. */
    long countByUserIdAndStatus(Long userId, ItemStatus status);

    /** Count all items for a given user — used in dashboard stats. */
    long countByUserId(Long userId);
}
