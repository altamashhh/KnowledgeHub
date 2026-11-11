package com.knowledgehub.knowledge.service;

import com.knowledgehub.common.PagedResponse;
import com.knowledgehub.exception.ResourceNotFoundException;
import com.knowledgehub.knowledge.ItemStatus;
import com.knowledgehub.knowledge.ItemType;
import com.knowledgehub.knowledge.KnowledgeItem;
import com.knowledgehub.knowledge.KnowledgeItemRepository;
import com.knowledgehub.knowledge.dto.CreateKnowledgeItemRequest;
import com.knowledgehub.knowledge.dto.ItemFilterParams;
import com.knowledgehub.knowledge.dto.KnowledgeItemResponse;
import com.knowledgehub.knowledge.dto.UpdateKnowledgeItemRequest;
import com.knowledgehub.search.SearchService;
import com.knowledgehub.tag.Tag;
import com.knowledgehub.tag.TagRepository;
import com.knowledgehub.topic.Topic;
import com.knowledgehub.topic.TopicRepository;
import com.knowledgehub.user.User;
import com.knowledgehub.user.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Business logic service for Knowledge Item CRUD operations.
 *
 * <p>Security & Isolation rules enforced:
 * <ul>
 *   <li>All operations require an authenticated {@code userId} retrieved from Spring Security context.</li>
 *   <li>Repository operations are strictly scoped by {@code userId}. Accessing another user's item
 *       returns HTTP 404 (ResourceNotFoundException) — never 403 — to prevent resource enumeration.</li>
 *   <li>Topic and Tag associations must belong to the authenticated user. Assigning another user's
 *       topic or tag throws ResourceNotFoundException (404).</li>
 * </ul>
 * </p>
 */
@Service
public class KnowledgeItemService {

    private final KnowledgeItemRepository knowledgeItemRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final TagRepository tagRepository;
    private final SearchService searchService;

    public KnowledgeItemService(KnowledgeItemRepository knowledgeItemRepository,
                                UserRepository userRepository,
                                TopicRepository topicRepository,
                                TagRepository tagRepository,
                                SearchService searchService) {
        this.knowledgeItemRepository = knowledgeItemRepository;
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.tagRepository = tagRepository;
        this.searchService = searchService;
    }

    /**
     * Quick Capture / Create a new Knowledge Item for the authenticated user.
     */
    @Transactional
    public KnowledgeItemResponse createItem(CreateKnowledgeItemRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Determine Quick Capture type default:
        // 1. Explicitly provided type takes precedence
        // 2. Non-empty URL -> WEBSITE
        // 3. Otherwise -> NOTE
        ItemType resolvedType = request.getType();
        if (resolvedType == null) {
            if (StringUtils.hasText(request.getUrl())) {
                resolvedType = ItemType.WEBSITE;
            } else {
                resolvedType = ItemType.NOTE;
            }
        }

        KnowledgeItem item = new KnowledgeItem(user, request.getTitle(), resolvedType);
        item.setUrl(request.getUrl());
        item.setContent(request.getContent());
        item.setDescription(request.getDescription());
        item.setContext(request.getContext());

        // Defaults enforced: status = INBOX, difficulty = null, rating = null

        // Topic assignment (if provided, must belong to the authenticated user)
        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findByIdAndUserId(request.getTopicId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Topic", request.getTopicId()));
            item.setTopic(topic);
        }

        // Tag assignment (if provided, resolve/create per-user tags)
        if (request.getTagNames() != null && !request.getTagNames().isEmpty()) {
            Set<Tag> tags = resolveUserTags(request.getTagNames(), user);
            item.setTags(tags);
        }

        KnowledgeItem savedItem = knowledgeItemRepository.save(item);
        return KnowledgeItemResponse.fromEntity(savedItem);
    }

    /**
     * Retrieve a single Knowledge Item by ID for the authenticated user.
     * Returns 404 if not found or owned by another user.
     */
    @Transactional(readOnly = true)
    public KnowledgeItemResponse getItem(Long itemId, Long userId) {
        KnowledgeItem item = knowledgeItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeItem", itemId));

        return KnowledgeItemResponse.fromEntity(item);
    }

    /**
     * Retrieve a paginated, optionally filtered list of Knowledge Items for the authenticated user.
     *
     * <p>Delegates to {@link SearchService} which applies JPA Specifications to
     * compose dynamic predicates. Ownership ({@code userId}) is always enforced
     * inside the specification — no item from another user can be returned.
     *
     * @param params   filter criteria built from query parameters; empty params = list all
     * @param userId   authenticated user's ID
     * @param pageable pagination and sort settings
     */
    @Transactional(readOnly = true)
    public PagedResponse<KnowledgeItemResponse> getItems(ItemFilterParams params, Long userId, Pageable pageable) {
        return searchService.search(params, userId, pageable);
    }

    /**
     * Full Update / Enrich a Knowledge Item for the authenticated user.
     * Returns 404 if item not found or owned by another user.
     */
    @Transactional
    public KnowledgeItemResponse updateItem(Long itemId, UpdateKnowledgeItemRequest request, Long userId) {
        KnowledgeItem item = knowledgeItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeItem", itemId));

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setContent(request.getContent());
        item.setUrl(request.getUrl());
        item.setContext(request.getContext());
        item.setDifficulty(request.getDifficulty());
        item.setRating(request.getRating());

        if (request.getType() != null) {
            item.setType(request.getType());
        }

        if (request.getStatus() != null) {
            if (request.getStatus() == ItemStatus.REVIEWED && item.getStatus() != ItemStatus.REVIEWED) {
                item.setLastReviewedAt(LocalDateTime.now());
            }
            item.setStatus(request.getStatus());
        }

        // Topic update (must belong to authenticated user)
        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findByIdAndUserId(request.getTopicId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Topic", request.getTopicId()));
            item.setTopic(topic);
        } else {
            item.setTopic(null);
        }

        // Tag update (must belong to authenticated user)
        if (request.getTagNames() != null) {
            Set<Tag> tags = resolveUserTags(request.getTagNames(), item.getUser());
            item.setTags(tags);
        }

        KnowledgeItem updatedItem = knowledgeItemRepository.save(item);
        return KnowledgeItemResponse.fromEntity(updatedItem);
    }

    /**
     * Delete a Knowledge Item for the authenticated user.
     * Returns 404 if item not found or owned by another user.
     */
    @Transactional
    public void deleteItem(Long itemId, Long userId) {
        KnowledgeItem item = knowledgeItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeItem", itemId));

        knowledgeItemRepository.delete(item);
    }

    /**
     * Helper method to resolve tag names to user-owned Tag entities,
     * creating new per-user Tag instances for any names not previously seen.
     */
    private Set<Tag> resolveUserTags(Set<String> tagNames, User user) {
        Set<Tag> tags = new HashSet<>();
        for (String rawName : tagNames) {
            if (StringUtils.hasText(rawName)) {
                String cleanName = rawName.trim();
                Tag tag = tagRepository.findByUserIdAndName(user.getId(), cleanName)
                        .orElseGet(() -> tagRepository.save(new Tag(user, cleanName)));
                tags.add(tag);
            }
        }
        return tags;
    }
}
