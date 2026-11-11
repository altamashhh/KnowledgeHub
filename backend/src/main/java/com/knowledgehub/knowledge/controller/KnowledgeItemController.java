package com.knowledgehub.knowledge.controller;

import com.knowledgehub.auth.security.UserPrincipal;
import com.knowledgehub.common.ApiResponse;
import com.knowledgehub.common.PagedResponse;
import com.knowledgehub.exception.InvalidSortFieldException;
import com.knowledgehub.knowledge.Difficulty;
import com.knowledgehub.knowledge.ItemStatus;
import com.knowledgehub.knowledge.ItemType;
import com.knowledgehub.knowledge.dto.CreateKnowledgeItemRequest;
import com.knowledgehub.knowledge.dto.ItemFilterParams;
import com.knowledgehub.knowledge.dto.KnowledgeItemResponse;
import com.knowledgehub.knowledge.dto.UpdateKnowledgeItemRequest;
import com.knowledgehub.knowledge.service.KnowledgeItemService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

/**
 * REST controller for Knowledge Item CRUD endpoints:
 * <ul>
 *   <li>{@code POST /api/v1/items} — Quick Capture / create knowledge item</li>
 *   <li>{@code GET /api/v1/items/{id}} — Read single item by ID</li>
 *   <li>{@code GET /api/v1/items} — Read paginated list of items</li>
 *   <li>{@code PUT /api/v1/items/{id}} — Full update / progressive enrichment</li>
 *   <li>{@code DELETE /api/v1/items/{id}} — Delete knowledge item</li>
 * </ul>
 *
 * <p>Security rule: User identity is extracted exclusively from the authenticated
 * {@link UserPrincipal}. {@code userId} is never accepted from request parameters.</p>
 */
@RestController
@RequestMapping("/api/v1/items")
public class KnowledgeItemController {

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of("createdAt", "updatedAt", "title", "rating");

    private final KnowledgeItemService knowledgeItemService;

    public KnowledgeItemController(KnowledgeItemService knowledgeItemService) {
        this.knowledgeItemService = knowledgeItemService;
    }

    /**
     * Create a new knowledge item (Quick Capture).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<KnowledgeItemResponse>> createItem(
            @Valid @RequestBody CreateKnowledgeItemRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        KnowledgeItemResponse response = knowledgeItemService.createItem(request, principal.getUserId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Knowledge item created successfully", response));
    }

    /**
     * Retrieve a single knowledge item by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KnowledgeItemResponse>> getItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        KnowledgeItemResponse response = knowledgeItemService.getItem(id, principal.getUserId());

        return ResponseEntity
                .ok(ApiResponse.success("Knowledge item retrieved successfully", response));
    }

    /**
     * Retrieve a paginated, optionally filtered list of knowledge items for the authenticated user.
     *
     * <p>All filter parameters are optional. Omitting a parameter means no filter
     * on that dimension. Multiple filters are AND-combined.
     *
     * @param keyword    case-insensitive substring match across title, description, content, context
     * @param status     filter by exact {@link ItemStatus} value
     * @param type       filter by exact {@link ItemType} value
     * @param difficulty filter by exact {@link Difficulty} value
     * @param topicId    filter by topic ID (must belong to the authenticated user)
     * @param tagName    case-insensitive substring match on any associated tag name
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<KnowledgeItemResponse>>> getItems(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) String tagName,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        if (pageable.getSort().isSorted()) {
            for (Sort.Order order : pageable.getSort()) {
                if (!ALLOWED_SORT_FIELDS.contains(order.getProperty())) {
                    throw new InvalidSortFieldException(order.getProperty(), ALLOWED_SORT_FIELDS);
                }
            }
        }

        ItemFilterParams params = ItemFilterParams.builder()
                .keyword(keyword)
                .status(status)
                .type(type)
                .difficulty(difficulty)
                .topicId(topicId)
                .tagName(tagName)
                .build();

        PagedResponse<KnowledgeItemResponse> response =
                knowledgeItemService.getItems(params, principal.getUserId(), pageable);

        return ResponseEntity
                .ok(ApiResponse.success("Knowledge items retrieved successfully", response));
    }

    /**
     * Update / enrich an existing knowledge item.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<KnowledgeItemResponse>> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateKnowledgeItemRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        KnowledgeItemResponse response = knowledgeItemService.updateItem(id, request, principal.getUserId());

        return ResponseEntity
                .ok(ApiResponse.success("Knowledge item updated successfully", response));
    }

    /**
     * Delete a knowledge item by ID. Returns 204 No Content on success.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        knowledgeItemService.deleteItem(id, principal.getUserId());

        return ResponseEntity.noContent().build();
    }
}
