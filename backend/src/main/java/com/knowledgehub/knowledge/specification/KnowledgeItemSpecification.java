package com.knowledgehub.knowledge.specification;

import com.knowledgehub.knowledge.KnowledgeItem;
import com.knowledgehub.knowledge.dto.ItemFilterParams;
import com.knowledgehub.tag.Tag;
import com.knowledgehub.topic.Topic;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Criteria API {@link Specification} factory for {@link KnowledgeItem} queries.
 *
 * <p>Each static method returns a composable {@code Specification} predicate.
 * {@link #forParams(Long, ItemFilterParams)} is the main entry point — it AND-combines
 * all active predicates based on the non-null fields in {@link ItemFilterParams}.</p>
 *
 * <h3>Ownership invariant:</h3>
 * <p>The {@code userId} predicate is <em>always</em> included, regardless of other
 * filters. This is the primary enforcement of per-user data isolation.
 * No code path can return items belonging to another user.</p>
 *
 * <h3>Tag join strategy:</h3>
 * <p>Tag filtering uses an INNER JOIN on {@code knowledge_item_tags} and {@code tags},
 * which means items with no tags are automatically excluded when a tag filter is active.
 * {@code query.distinct(true)} is applied to prevent duplicate rows when an item has
 * multiple tags that all match the name pattern.</p>
 *
 * <p>Defense-in-depth: the tag filter also asserts {@code tag.user_id = authenticatedUserId},
 * so even if a cross-user tag association were introduced by a future bug, it could
 * never surface in search results.</p>
 */
public final class KnowledgeItemSpecification {

    private KnowledgeItemSpecification() {
        // utility class — no instances
    }

    /**
     * Build a fully composed {@code Specification} for the given user and filter params.
     *
     * <p>This is the single entry point used by {@code KnowledgeItemService}.
     * Always includes a {@code userId} predicate. All other predicates are
     * added only when the corresponding field in {@code params} is non-null.</p>
     *
     * @param userId the authenticated user's ID — never null
     * @param params the filter parameters — never null (may be empty)
     * @return a composed {@code Specification<KnowledgeItem>}
     */
    public static Specification<KnowledgeItem> forParams(Long userId, ItemFilterParams params) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ── Ownership predicate (ALWAYS applied) ──────────────────────────
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            // ── Keyword search (LIKE across multiple text fields) ─────────────
            if (StringUtils.hasText(params.getKeyword())) {
                String pattern = "%" + params.getKeyword().toLowerCase() + "%";
                Predicate titleLike       = cb.like(cb.lower(root.get("title")),       pattern);
                Predicate descriptionLike = cb.like(cb.lower(root.get("description")), pattern);
                Predicate contentLike     = cb.like(cb.lower(root.get("content")),     pattern);
                Predicate contextLike     = cb.like(cb.lower(root.get("context")),     pattern);
                predicates.add(cb.or(titleLike, descriptionLike, contentLike, contextLike));
            }

            // ── Status filter ─────────────────────────────────────────────────
            if (params.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), params.getStatus()));
            }

            // ── Type filter ───────────────────────────────────────────────────
            if (params.getType() != null) {
                predicates.add(cb.equal(root.get("type"), params.getType()));
            }

            // ── Difficulty filter ─────────────────────────────────────────────
            if (params.getDifficulty() != null) {
                predicates.add(cb.equal(root.get("difficulty"), params.getDifficulty()));
            }

            // ── Topic filter ──────────────────────────────────────────────────
            if (params.getTopicId() != null) {
                Join<KnowledgeItem, Topic> topicJoin = root.join("topic", JoinType.INNER);
                predicates.add(cb.equal(topicJoin.get("id"), params.getTopicId()));
            }

            // ── Tag name filter ───────────────────────────────────────────────
            if (StringUtils.hasText(params.getTagName())) {
                Join<KnowledgeItem, Tag> tagJoin = root.join("tags", JoinType.INNER);

                // Tag name: case-insensitive partial match
                predicates.add(cb.like(cb.lower(tagJoin.get("name")),
                        "%" + params.getTagName().toLowerCase() + "%"));

                // Defense-in-depth: explicitly assert tag belongs to the authenticated user.
                // The item ownership predicate already guarantees correctness structurally,
                // but this makes tag isolation unconditional at the predicate level.
                predicates.add(cb.equal(tagJoin.get("user").get("id"), userId));

                // Prevent duplicate rows when an item has multiple tags
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
