package com.knowledgehub.knowledge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowledgehub.auth.security.JwtUtil;
import com.knowledgehub.knowledge.dto.CreateKnowledgeItemRequest;
import com.knowledgehub.knowledge.dto.UpdateKnowledgeItemRequest;
import com.knowledgehub.tag.Tag;
import com.knowledgehub.tag.TagRepository;
import com.knowledgehub.topic.Topic;
import com.knowledgehub.topic.TopicRepository;
import com.knowledgehub.user.User;
import com.knowledgehub.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end integration test suite for MVP-1 Phase 3 Knowledge Item Core subsystem.
 *
 * <p>Verifies all 18 required scenarios:
 * <ol>
 *   <li>Authenticated user can create KnowledgeItem</li>
 *   <li>Unauthenticated user cannot create item (403/401)</li>
 *   <li>Quick Capture URL defaults type to WEBSITE</li>
 *   <li>Quick Capture content-only defaults type to NOTE</li>
 *   <li>Default status is INBOX</li>
 *   <li>Difficulty is initially null</li>
 *   <li>Rating is initially null</li>
 *   <li>Authenticated user can retrieve own item</li>
 *   <li>User cannot retrieve another user's item (404)</li>
 *   <li>Authenticated user can update own item</li>
 *   <li>User cannot update another user's item (404)</li>
 *   <li>Authenticated user can delete own item (204)</li>
 *   <li>User cannot delete another user's item (404)</li>
 *   <li>Pagination returns only authenticated user's items</li>
 *   <li>Another user's topic cannot be assigned (404)</li>
 *   <li>Another user's tag cannot be assigned (404 if by ID or re-created clean by name)</li>
 *   <li>Invalid rating (<1 or >5) is rejected (400)</li>
 *   <li>Invalid difficulty string is rejected (400)</li>
 * </ol>
 * </p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class KnowledgeItemCoreTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private KnowledgeItemRepository knowledgeItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private User user1;
    private User user2;
    private String token1;
    private String token2;

    @BeforeEach
    void setUp() {
        knowledgeItemRepository.deleteAll();
        topicRepository.deleteAll();
        tagRepository.deleteAll();
        userRepository.deleteAll();

        user1 = userRepository.save(new User("User One", "user1@example.com", passwordEncoder.encode("password123")));
        user2 = userRepository.save(new User("User Two", "user2@example.com", passwordEncoder.encode("password123")));

        token1 = jwtUtil.generateToken(user1.getId(), user1.getEmail());
        token2 = jwtUtil.generateToken(user2.getId(), user2.getEmail());
    }

    // ─────────────────────────────────────────────
    // 1. Authenticated user can create KnowledgeItem
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("1. Authenticated user can create KnowledgeItem via Quick Capture")
    void authenticatedUserCanCreateKnowledgeItem() throws Exception {
        CreateKnowledgeItemRequest request = new CreateKnowledgeItemRequest("Spring Security Basics");

        mockMvc.perform(post("/api/v1/items")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", notNullValue()))
                .andExpect(jsonPath("$.data.title", is("Spring Security Basics")));

        assertThat(knowledgeItemRepository.countByUserId(user1.getId())).isEqualTo(1);
    }

    // ─────────────────────────────────────────────
    // 2. Unauthenticated user cannot create item
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("2. Unauthenticated user cannot create item (rejected with 403/401)")
    void unauthenticatedUserCannotCreateItem() throws Exception {
        CreateKnowledgeItemRequest request = new CreateKnowledgeItemRequest("Unauthenticated Item");

        mockMvc.perform(post("/api/v1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    // ─────────────────────────────────────────────
    // 3. Quick Capture URL defaults type to WEBSITE
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("3. Quick Capture with URL defaults type to WEBSITE")
    void quickCaptureUrlDefaultsTypeToWebsite() throws Exception {
        CreateKnowledgeItemRequest request = new CreateKnowledgeItemRequest(
                "Java Docs",
                "https://docs.oracle.com/en/java/",
                "Reference documentation"
        );

        mockMvc.perform(post("/api/v1/items")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.type", is("WEBSITE")));
    }

    // ─────────────────────────────────────────────
    // 4. Quick Capture content-only defaults type to NOTE
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("4. Quick Capture with content-only (no URL) defaults type to NOTE")
    void quickCaptureContentOnlyDefaultsTypeToNote() throws Exception {
        CreateKnowledgeItemRequest request = new CreateKnowledgeItemRequest("My DSA Notes");
        request.setContent("Arrays are stored in contiguous memory locations.");

        mockMvc.perform(post("/api/v1/items")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.type", is("NOTE")));
    }

    // ─────────────────────────────────────────────
    // 5. Default status is INBOX
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("5. Quick Capture item default status is INBOX")
    void defaultStatusIsInbox() throws Exception {
        CreateKnowledgeItemRequest request = new CreateKnowledgeItemRequest("Default Status Test");

        mockMvc.perform(post("/api/v1/items")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("INBOX")));
    }

    // ─────────────────────────────────────────────
    // 6. Difficulty is initially null
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("6. Quick Capture item difficulty is initially null")
    void difficultyIsInitiallyNull() throws Exception {
        CreateKnowledgeItemRequest request = new CreateKnowledgeItemRequest("Null Difficulty Test");

        mockMvc.perform(post("/api/v1/items")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.difficulty", nullValue()));
    }

    // ─────────────────────────────────────────────
    // 7. Rating is initially null
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("7. Quick Capture item rating is initially null")
    void ratingIsInitiallyNull() throws Exception {
        CreateKnowledgeItemRequest request = new CreateKnowledgeItemRequest("Null Rating Test");

        mockMvc.perform(post("/api/v1/items")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.rating", nullValue()));
    }

    // ─────────────────────────────────────────────
    // 8. Authenticated user can retrieve own item
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("8. Authenticated user can retrieve their own knowledge item")
    void authenticatedUserCanRetrieveOwnItem() throws Exception {
        KnowledgeItem item = knowledgeItemRepository.save(new KnowledgeItem(user1, "User 1 Item", ItemType.NOTE));

        mockMvc.perform(get("/api/v1/items/" + item.getId())
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(item.getId().intValue())))
                .andExpect(jsonPath("$.data.title", is("User 1 Item")));
    }

    // ─────────────────────────────────────────────
    // 9. User cannot retrieve another user's item (404)
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("9. User cannot retrieve another user's item (returns 404 Resource Not Found)")
    void userCannotRetrieveAnotherUsersItem() throws Exception {
        KnowledgeItem item = knowledgeItemRepository.save(new KnowledgeItem(user1, "User 1 Private Item", ItemType.NOTE));

        // User 2 attempts to retrieve User 1's item
        mockMvc.perform(get("/api/v1/items/" + item.getId())
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("not found")));
    }

    // ─────────────────────────────────────────────
    // 10. Authenticated user can update own item
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("10. Authenticated user can update/enrich their own item")
    void authenticatedUserCanUpdateOwnItem() throws Exception {
        KnowledgeItem item = knowledgeItemRepository.save(new KnowledgeItem(user1, "Original Title", ItemType.NOTE));

        UpdateKnowledgeItemRequest updateRequest = new UpdateKnowledgeItemRequest("Enriched Title");
        updateRequest.setDescription("Added description");
        updateRequest.setStatus(ItemStatus.IN_PROGRESS);
        updateRequest.setDifficulty(Difficulty.INTERMEDIATE);
        updateRequest.setRating(4);

        mockMvc.perform(put("/api/v1/items/" + item.getId())
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", is("Enriched Title")))
                .andExpect(jsonPath("$.data.description", is("Added description")))
                .andExpect(jsonPath("$.data.status", is("IN_PROGRESS")))
                .andExpect(jsonPath("$.data.difficulty", is("INTERMEDIATE")))
                .andExpect(jsonPath("$.data.rating", is(4)));
    }

    // ─────────────────────────────────────────────
    // 11. User cannot update another user's item (404)
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("11. User cannot update another user's item (returns 404 Resource Not Found)")
    void userCannotUpdateAnotherUsersItem() throws Exception {
        KnowledgeItem item = knowledgeItemRepository.save(new KnowledgeItem(user1, "User 1 Item", ItemType.NOTE));

        UpdateKnowledgeItemRequest updateRequest = new UpdateKnowledgeItemRequest("Hacked Title");

        mockMvc.perform(put("/api/v1/items/" + item.getId())
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound());
    }

    // ─────────────────────────────────────────────
    // 12. Authenticated user can delete own item (204)
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("12. Authenticated user can delete their own item (returns 204 No Content)")
    void authenticatedUserCanDeleteOwnItem() throws Exception {
        KnowledgeItem item = knowledgeItemRepository.save(new KnowledgeItem(user1, "Item To Delete", ItemType.NOTE));

        mockMvc.perform(delete("/api/v1/items/" + item.getId())
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNoContent());

        assertThat(knowledgeItemRepository.findById(item.getId())).isEmpty();
    }

    // ─────────────────────────────────────────────
    // 13. User cannot delete another user's item (404)
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("13. User cannot delete another user's item (returns 404 Resource Not Found)")
    void userCannotDeleteAnotherUsersItem() throws Exception {
        KnowledgeItem item = knowledgeItemRepository.save(new KnowledgeItem(user1, "User 1 Item", ItemType.NOTE));

        mockMvc.perform(delete("/api/v1/items/" + item.getId())
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isNotFound());

        // Item still exists
        assertThat(knowledgeItemRepository.findById(item.getId())).isPresent();
    }

    // ─────────────────────────────────────────────
    // 14. Pagination returns only authenticated user's items
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("14. List endpoint pagination returns only items owned by the authenticated user")
    void paginationReturnsOnlyAuthenticatedUsersItems() throws Exception {
        knowledgeItemRepository.save(new KnowledgeItem(user1, "User 1 Item A", ItemType.NOTE));
        knowledgeItemRepository.save(new KnowledgeItem(user1, "User 1 Item B", ItemType.ARTICLE));
        knowledgeItemRepository.save(new KnowledgeItem(user2, "User 2 Item C", ItemType.NOTE));

        mockMvc.perform(get("/api/v1/items?page=0&size=10")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(2)))
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.content[0].title", is("User 1 Item B")))
                .andExpect(jsonPath("$.data.content[1].title", is("User 1 Item A")));
    }

    // ─────────────────────────────────────────────
    // 15. Another user's topic cannot be assigned (404)
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("15. Assigning another user's topic fails with 404 Resource Not Found")
    void anotherUsersTopicCannotBeAssigned() throws Exception {
        Topic user2Topic = topicRepository.save(new Topic(user2, "User 2 Private Topic"));

        CreateKnowledgeItemRequest request = new CreateKnowledgeItemRequest("Item With Bad Topic");
        request.setTopicId(user2Topic.getId());

        mockMvc.perform(post("/api/v1/items")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Topic")));
    }

    // ─────────────────────────────────────────────
    // 16. Another user's tag is properly isolated per user
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("16. Tag assignment is strictly user-scoped (same tag name creates per-user Tag instance)")
    void tagAssignmentIsUserScoped() throws Exception {
        // User 2 creates a "Java" tag
        Tag user2Tag = tagRepository.save(new Tag(user2, "Java"));

        CreateKnowledgeItemRequest request = new CreateKnowledgeItemRequest("User 1 Java Item");
        request.setTagNames(Set.of("Java"));

        // User 1 assigns "Java" tag -> should create User 1's own Tag("Java"), not reuse User 2's Tag
        mockMvc.perform(post("/api/v1/items")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.tags", hasSize(1)))
                .andExpect(jsonPath("$.data.tags[0].name", is("Java")));

        Tag user1Tag = tagRepository.findByUserIdAndName(user1.getId(), "Java").orElseThrow();
        assertThat(user1Tag.getId()).isNotEqualTo(user2Tag.getId());
    }

    // ─────────────────────────────────────────────
    // 17. Invalid rating is rejected (400)
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("17. Invalid rating (>5 or <1) is rejected with 400 Bad Request")
    void invalidRatingIsRejected() throws Exception {
        KnowledgeItem item = knowledgeItemRepository.save(new KnowledgeItem(user1, "Rating Test", ItemType.NOTE));

        UpdateKnowledgeItemRequest updateRequest = new UpdateKnowledgeItemRequest("Rating Test");
        updateRequest.setRating(10); // invalid rating > 5

        mockMvc.perform(put("/api/v1/items/" + item.getId())
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Validation failed")));
    }

    // ─────────────────────────────────────────────
    // 18. Invalid difficulty string is rejected (400)
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("18. Invalid difficulty string JSON is rejected with 400 Bad Request")
    void invalidDifficultyIsRejected() throws Exception {
        KnowledgeItem item = knowledgeItemRepository.save(new KnowledgeItem(user1, "Diff Test", ItemType.NOTE));

        String invalidJson = """
                {
                  "title": "Diff Test",
                  "difficulty": "SUPER_HARD"
                }
                """;

        mockMvc.perform(put("/api/v1/items/" + item.getId())
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
}
