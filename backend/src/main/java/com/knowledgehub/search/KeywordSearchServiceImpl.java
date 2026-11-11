package com.knowledgehub.search;

import com.knowledgehub.common.PagedResponse;
import com.knowledgehub.knowledge.KnowledgeItem;
import com.knowledgehub.knowledge.KnowledgeItemRepository;
import com.knowledgehub.knowledge.dto.ItemFilterParams;
import com.knowledgehub.knowledge.dto.KnowledgeItemResponse;
import com.knowledgehub.knowledge.specification.KnowledgeItemSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * MVP-1 implementation of {@link SearchService} using JPA {@code Specification}
 * predicates (Criteria API) for dynamic, user-scoped filtering.
 *
 * <h3>Strategy:</h3>
 * <p>All active filter dimensions are composed into a single
 * {@code Specification<KnowledgeItem>} via AND logic. The specification
 * is passed to {@code KnowledgeItemRepository.findAll(Specification, Pageable)},
 * which Spring Data translates into a single parameterised SQL query.</p>
 *
 * <h3>Ownership guarantee:</h3>
 * <p>{@link KnowledgeItemSpecification#forParams(Long, ItemFilterParams)} always
 * includes a {@code WHERE user_id = :userId} predicate, so no item from another
 * user can ever appear in the results regardless of filter combination.</p>
 *
 * <h3>Future replacement:</h3>
 * <p>When full-text or semantic search is introduced, a new implementation of
 * {@link SearchService} can be swapped in via Spring's qualifier mechanism.
 * The controller and service caller do not need to change.</p>
 */
@Service
@Transactional(readOnly = true)
public class KeywordSearchServiceImpl implements SearchService {

    private final KnowledgeItemRepository knowledgeItemRepository;

    public KeywordSearchServiceImpl(KnowledgeItemRepository knowledgeItemRepository) {
        this.knowledgeItemRepository = knowledgeItemRepository;
    }

    /**
     * Execute a user-scoped, filter-composed search.
     *
     * <p>Builds a {@code Specification} from {@code params} and {@code userId},
     * then delegates to the repository. Results are mapped to response DTOs
     * before wrapping in a {@link PagedResponse}.</p>
     *
     * @param params   filter criteria — all fields nullable (null = no filter)
     * @param userId   authenticated user's ID — always included in WHERE clause
     * @param pageable pagination and sort settings from the controller
     * @return paginated response of matching items owned by userId
     */
    @Override
    public PagedResponse<KnowledgeItemResponse> search(ItemFilterParams params,
                                                       Long userId,
                                                       Pageable pageable) {
        Specification<KnowledgeItem> spec = KnowledgeItemSpecification.forParams(userId, params);
        Page<KnowledgeItem> page = knowledgeItemRepository.findAll(spec, pageable);
        Page<KnowledgeItemResponse> dtoPage = page.map(KnowledgeItemResponse::fromEntity);
        return PagedResponse.from(dtoPage);
    }
}
