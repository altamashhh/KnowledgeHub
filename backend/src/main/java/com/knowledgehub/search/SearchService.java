package com.knowledgehub.search;

import com.knowledgehub.common.PagedResponse;
import com.knowledgehub.knowledge.dto.ItemFilterParams;
import com.knowledgehub.knowledge.dto.KnowledgeItemResponse;
import org.springframework.data.domain.Pageable;

/**
 * Search service interface — the architectural extension point for search.
 *
 * <p>This interface decouples the search caller ({@code KnowledgeItemController})
 * from the search implementation. This is the Open/Closed Principle applied:
 * the controller is open for extension (swap implementations) but closed for
 * modification (controller code never changes when search strategy changes).</p>
 *
 * <h3>Phase 1 (MVP-1): Keyword LIKE search</h3>
 * <p>{@code KeywordSearchServiceImpl} uses JPA {@code Specification} predicates
 * to compose dynamic LIKE queries across title, description, content,
 * context, and tag names.</p>
 *
 * <h3>Phase 2 (MVP-2): MySQL FULLTEXT upgrade</h3>
 * <p>Replace the Specification-based LIKE with {@code MATCH...AGAINST} for
 * better relevance scoring. No controller changes required.</p>
 *
 * <h3>Phase 4: AI/Semantic search</h3>
 * <p>{@code SemanticSearchServiceImpl} embeds the query, performs cosine
 * similarity lookup, and returns results. The controller still calls the
 * same method signature.</p>
 */
public interface SearchService {

    /**
     * Search and filter knowledge items belonging to the authenticated user.
     *
     * <p>Ownership isolation is enforced internally — results are always
     * restricted to items owned by {@code userId}.</p>
     *
     * @param params   filter and keyword parameters; all fields are nullable
     *                 (null = no filter on that dimension)
     * @param userId   the authenticated user's ID — never null
     * @param pageable pagination and sort specification
     * @return paginated response of matching knowledge items
     */
    PagedResponse<KnowledgeItemResponse> search(ItemFilterParams params, Long userId, Pageable pageable);
}
