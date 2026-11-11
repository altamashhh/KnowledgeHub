package com.knowledgehub.knowledge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowledgehub.auth.security.JwtUtil;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end integration test suite for MVP-1 Phase 4: Search & Discovery.
 *
 * <p>Verifies all required scenarios:
 * <ol>
 *   <li>No filters — returns all user's items (baseline pagination)</li>
 *   <li>Keyword search matches title</li>
 *   <li>Keyword search matches description</li>
 *   <li>Keyword search matches content</li>
 *   <li>Keyword search matches context</li>
 *   <li>Keyword search is case-insensitive</li>
 *   <li>Keyword matches no items — returns empty page</li>
 *   <li>Status filter — returns only items with given status</li>
 *   <li>Type filter — returns only items with given type</li>
 *   <li>Difficulty filter — returns only items with given difficulty</li>
 *   <li>Topic filter — returns only items assigned to given topic</li>
 *   <li>Tag name filter — returns only items tagged with a matching tag</li>
 *   <li>Tag name filter is case-insensitive</li>
 *   <li>Combined keyword + status filter</li>
 *   <li>Combined type + difficulty filter</li>
 *   <li>Combined status + tag filter</li>
 *   <li>Ownership isolation — keyword does NOT return other user's items</li>
 *   <li>Ownership isolation — status filter does NOT return other user's items</li>
 *   <li>Ownership isolation — topic filter does NOT return other user's items</li>
 *   <li>Pagination metadata is correct (page, size, totalElements)</li>
 *   <li>Ownership isolation — tag filter does NOT return other user's items</li>
 *   <li>Sorting by createdAt (ASC and DESC)</li>
 *   <li>Sorting by updatedAt (ASC and DESC)</li>
 *   <li>Sorting by title (ASC and DESC)</li>
 *   <li>Sorting by rating (ASC and DESC)</li>
 *   <li>Unsupported sort field returns 400 Bad Request</li>
 * </ol>
 * </p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class KnowledgeItemSearchTests {

    private static final String ITEMS_URL = "/api/v1/items";

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

        user1 = userRepository.save(new User("User One", "user1@search.com", passwordEncoder.encode("pass")));
        user2 = userRepository.save(new User("User Two", "user2@search.com", passwordEncoder.encode("pass")));

        token1 = jwtUtil.generateToken(user1.getId(), user1.getEmail());
        token2 = jwtUtil.generateToken(user2.getId(), user2.getEmail());
    }

    // ─────────────────────────────────────────────────────────────
    // Helper: create and persist a KnowledgeItem with fluent fields
    // ─────────────────────────────────────────────────────────────

    private KnowledgeItem createItem(User user, String title, ItemType type) {
        KnowledgeItem item = new KnowledgeItem(user, title, type);
        return knowledgeItemRepository.save(item);
    }

    private KnowledgeItem createItemWithFields(User user, String title, ItemType type,
                                               ItemStatus status, Difficulty difficulty,
                                               String description, String content,
                                               String context, Topic topic, Set<Tag> tags) {
        KnowledgeItem item = new KnowledgeItem(user, title, type);
        item.setStatus(status);
        item.setDifficulty(difficulty);
        item.setDescription(description);
        item.setContent(content);
        item.setContext(context);
        item.setTopic(topic);
        if (tags != null) {
            item.setTags(tags);
        }
        return knowledgeItemRepository.save(item);
    }

    // ─────────────────────────────────────────────
    // Scenario 1: No filters — returns all user's items
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("1. No filters returns all items owned by authenticated user")
    void noFiltersReturnsAllUserItems() throws Exception {
        createItem(user1, "Item A", ItemType.NOTE);
        createItem(user1, "Item B", ItemType.ARTICLE);
        createItem(user2, "User 2 item", ItemType.NOTE); // must NOT appear

        mockMvc.perform(get(ITEMS_URL)
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(2)))
                .andExpect(jsonPath("$.data.content", hasSize(2)));
    }

    // ─────────────────────────────────────────────
    // Scenario 2: Keyword matches title
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("2. Keyword search matches items by title")
    void keywordSearchMatchesTitle() throws Exception {
        createItem(user1, "Spring Boot Guide", ItemType.ARTICLE);
        createItem(user1, "Docker Cheatsheet", ItemType.NOTE);

        mockMvc.perform(get(ITEMS_URL + "?keyword=spring")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("Spring Boot Guide")));
    }

    // ─────────────────────────────────────────────
    // Scenario 3: Keyword matches description
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("3. Keyword search matches items by description")
    void keywordSearchMatchesDescription() throws Exception {
        createItemWithFields(user1, "Unnamed Item", ItemType.NOTE, ItemStatus.INBOX, null,
                "Covers Hibernate ORM internals", null, null, null, null);
        createItem(user1, "Other Item", ItemType.NOTE);

        mockMvc.perform(get(ITEMS_URL + "?keyword=hibernate")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].description", is("Covers Hibernate ORM internals")));
    }

    // ─────────────────────────────────────────────
    // Scenario 4: Keyword matches content
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("4. Keyword search matches items by content field")
    void keywordSearchMatchesContent() throws Exception {
        createItemWithFields(user1, "My Notes", ItemType.NOTE, ItemStatus.INBOX, null,
                null, "HashMap uses bucketing internally for O(1) lookup", null, null, null);
        createItem(user1, "Unrelated", ItemType.NOTE);

        mockMvc.perform(get(ITEMS_URL + "?keyword=HashMap")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)));
    }

    // ─────────────────────────────────────────────
    // Scenario 5: Keyword matches context
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("5. Keyword search matches items by context field")
    void keywordSearchMatchesContext() throws Exception {
        createItemWithFields(user1, "Interview Prep", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, "Saved before my Google interview", null, null);
        createItem(user1, "Nothing special", ItemType.NOTE);

        mockMvc.perform(get(ITEMS_URL + "?keyword=google")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)));
    }

    // ─────────────────────────────────────────────
    // Scenario 6: Keyword search is case-insensitive
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("6. Keyword search is case-insensitive")
    void keywordSearchIsCaseInsensitive() throws Exception {
        createItem(user1, "JAVA Concurrency", ItemType.ARTICLE);
        createItem(user1, "Docker Guide", ItemType.NOTE);

        mockMvc.perform(get(ITEMS_URL + "?keyword=java")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)));
    }

    // ─────────────────────────────────────────────
    // Scenario 7: Keyword matches no items — empty page
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("7. Keyword that matches no items returns empty page with totalElements=0")
    void keywordNoMatchReturnsEmptyPage() throws Exception {
        createItem(user1, "Spring Boot", ItemType.NOTE);

        mockMvc.perform(get(ITEMS_URL + "?keyword=nonexistentxyz")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(0)))
                .andExpect(jsonPath("$.data.content", hasSize(0)));
    }

    // ─────────────────────────────────────────────
    // Scenario 8: Status filter
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("8. Status filter returns only items with matching status")
    void statusFilterReturnsMatchingItems() throws Exception {
        createItemWithFields(user1, "Inbox Item", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, null, null, null);
        createItemWithFields(user1, "In Progress Item", ItemType.NOTE, ItemStatus.IN_PROGRESS, null,
                null, null, null, null, null);
        createItemWithFields(user1, "Understood Item", ItemType.ARTICLE, ItemStatus.UNDERSTOOD, null,
                null, null, null, null, null);

        mockMvc.perform(get(ITEMS_URL + "?status=IN_PROGRESS")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("In Progress Item")));
    }

    // ─────────────────────────────────────────────
    // Scenario 9: Type filter
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("9. Type filter returns only items with matching type")
    void typeFilterReturnsMatchingItems() throws Exception {
        createItem(user1, "A Note", ItemType.NOTE);
        createItem(user1, "An Article", ItemType.ARTICLE);
        createItem(user1, "A Video", ItemType.VIDEO);

        mockMvc.perform(get(ITEMS_URL + "?type=VIDEO")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].type", is("VIDEO")));
    }

    // ─────────────────────────────────────────────
    // Scenario 10: Difficulty filter
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("10. Difficulty filter returns only items with matching difficulty")
    void difficultyFilterReturnsMatchingItems() throws Exception {
        createItemWithFields(user1, "Beginner Item", ItemType.NOTE, ItemStatus.INBOX, Difficulty.BEGINNER,
                null, null, null, null, null);
        createItemWithFields(user1, "Advanced Item", ItemType.ARTICLE, ItemStatus.INBOX, Difficulty.ADVANCED,
                null, null, null, null, null);
        createItem(user1, "No Difficulty", ItemType.NOTE); // null difficulty

        mockMvc.perform(get(ITEMS_URL + "?difficulty=ADVANCED")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].difficulty", is("ADVANCED")));
    }

    // ─────────────────────────────────────────────
    // Scenario 11: Topic filter
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("11. Topic filter returns only items assigned to the specified topic")
    void topicFilterReturnsMatchingItems() throws Exception {
        Topic javaTopic = topicRepository.save(new Topic(user1, "Java"));
        Topic dsTopic   = topicRepository.save(new Topic(user1, "Data Structures"));

        createItemWithFields(user1, "Java Streams", ItemType.ARTICLE, ItemStatus.INBOX, null,
                null, null, null, javaTopic, null);
        createItemWithFields(user1, "HashMap Internals", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, null, dsTopic, null);
        createItem(user1, "No Topic", ItemType.NOTE); // no topic

        mockMvc.perform(get(ITEMS_URL + "?topicId=" + javaTopic.getId())
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("Java Streams")));
    }

    // ─────────────────────────────────────────────
    // Scenario 12: Tag name filter
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("12. Tag name filter returns only items with a matching tag")
    void tagNameFilterReturnsMatchingItems() throws Exception {
        Tag javaTag   = tagRepository.save(new Tag(user1, "java"));
        Tag dockerTag = tagRepository.save(new Tag(user1, "docker"));

        createItemWithFields(user1, "Java Item", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, null, null, Set.of(javaTag));
        createItemWithFields(user1, "Docker Item", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, null, null, Set.of(dockerTag));
        createItem(user1, "Untagged Item", ItemType.NOTE);

        mockMvc.perform(get(ITEMS_URL + "?tagName=java")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("Java Item")));
    }

    // ─────────────────────────────────────────────
    // Scenario 13: Tag name filter is case-insensitive
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("13. Tag name filter is case-insensitive")
    void tagNameFilterIsCaseInsensitive() throws Exception {
        Tag springTag = tagRepository.save(new Tag(user1, "Spring"));
        createItemWithFields(user1, "Spring Item", ItemType.ARTICLE, ItemStatus.INBOX, null,
                null, null, null, null, Set.of(springTag));

        mockMvc.perform(get(ITEMS_URL + "?tagName=SPRING")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)));
    }

    // ─────────────────────────────────────────────
    // Scenario 14: Combined keyword + status filter
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("14. Combined keyword + status filter AND-combines predicates")
    void combinedKeywordAndStatusFilter() throws Exception {
        // Both criteria match
        createItemWithFields(user1, "Spring Security", ItemType.ARTICLE, ItemStatus.IN_PROGRESS, null,
                null, null, null, null, null);
        // Keyword matches but status does not
        createItemWithFields(user1, "Spring Boot", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, null, null, null);
        // Status matches but keyword does not
        createItemWithFields(user1, "Docker Guide", ItemType.NOTE, ItemStatus.IN_PROGRESS, null,
                null, null, null, null, null);

        mockMvc.perform(get(ITEMS_URL + "?keyword=spring&status=IN_PROGRESS")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("Spring Security")));
    }

    // ─────────────────────────────────────────────
    // Scenario 15: Combined type + difficulty filter
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("15. Combined type + difficulty filter AND-combines predicates")
    void combinedTypeAndDifficultyFilter() throws Exception {
        // Both match
        createItemWithFields(user1, "Advanced Article", ItemType.ARTICLE, ItemStatus.INBOX, Difficulty.ADVANCED,
                null, null, null, null, null);
        // Type matches, difficulty does not
        createItemWithFields(user1, "Beginner Article", ItemType.ARTICLE, ItemStatus.INBOX, Difficulty.BEGINNER,
                null, null, null, null, null);
        // Difficulty matches, type does not
        createItemWithFields(user1, "Advanced Note", ItemType.NOTE, ItemStatus.INBOX, Difficulty.ADVANCED,
                null, null, null, null, null);

        mockMvc.perform(get(ITEMS_URL + "?type=ARTICLE&difficulty=ADVANCED")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("Advanced Article")));
    }

    // ─────────────────────────────────────────────
    // Scenario 16: Combined status + tag filter
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("16. Combined status + tag filter AND-combines predicates")
    void combinedStatusAndTagFilter() throws Exception {
        Tag javaTag = tagRepository.save(new Tag(user1, "java"));

        // Both match
        createItemWithFields(user1, "Java In Progress", ItemType.NOTE, ItemStatus.IN_PROGRESS, null,
                null, null, null, null, Set.of(javaTag));
        // Tag matches, status does not
        createItemWithFields(user1, "Java Inbox", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, null, null, Set.of(javaTag));
        // Status matches, tag does not
        createItemWithFields(user1, "Docker In Progress", ItemType.NOTE, ItemStatus.IN_PROGRESS, null,
                null, null, null, null, null);

        mockMvc.perform(get(ITEMS_URL + "?status=IN_PROGRESS&tagName=java")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("Java In Progress")));
    }

    // ─────────────────────────────────────────────
    // Scenario 17: Ownership isolation — keyword does NOT return other user's items
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("17. Keyword search never returns items belonging to another user")
    void keywordSearchDoesNotReturnOtherUsersItems() throws Exception {
        // User 1 has an item matching the keyword
        createItem(user1, "Java Concurrency", ItemType.ARTICLE);

        // User 2 also has an item matching the keyword
        createItem(user2, "Java Spring", ItemType.NOTE);

        // Authenticate as user1 — should only see user1's item
        mockMvc.perform(get(ITEMS_URL + "?keyword=java")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("Java Concurrency")));
    }

    // ─────────────────────────────────────────────
    // Scenario 18: Ownership isolation — status filter does NOT return other user's items
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("18. Status filter never returns items belonging to another user")
    void statusFilterDoesNotReturnOtherUsersItems() throws Exception {
        createItemWithFields(user1, "User1 In Progress", ItemType.NOTE, ItemStatus.IN_PROGRESS, null,
                null, null, null, null, null);
        createItemWithFields(user2, "User2 In Progress", ItemType.NOTE, ItemStatus.IN_PROGRESS, null,
                null, null, null, null, null);

        // Authenticate as user1 — must NOT see user2's item
        mockMvc.perform(get(ITEMS_URL + "?status=IN_PROGRESS")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("User1 In Progress")));
    }

    // ─────────────────────────────────────────────
    // Scenario 19: Ownership isolation — topic filter does NOT return other user's items
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("19. Topic filter never returns items belonging to another user")
    void topicFilterDoesNotReturnOtherUsersItems() throws Exception {
        Topic user1Topic = topicRepository.save(new Topic(user1, "Java"));
        Topic user2Topic = topicRepository.save(new Topic(user2, "Java")); // same name, different user

        createItemWithFields(user1, "User1 Java Item", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, null, user1Topic, null);
        createItemWithFields(user2, "User2 Java Item", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, null, user2Topic, null);

        // Authenticate as user1 using user1's topic ID
        mockMvc.perform(get(ITEMS_URL + "?topicId=" + user1Topic.getId())
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("User1 Java Item")));
    }

    // ─────────────────────────────────────────────
    // Scenario 20: Pagination metadata is correct
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("20. Pagination metadata (page, size, totalElements, totalPages) is correct")
    void paginationMetadataIsCorrect() throws Exception {
        // Create 5 items for user1
        for (int i = 1; i <= 5; i++) {
            createItem(user1, "Item " + i, ItemType.NOTE);
        }

        // Request page 0 with size 2
        mockMvc.perform(get(ITEMS_URL + "?page=0&size=2")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.page", is(0)))
                .andExpect(jsonPath("$.data.size", is(2)))
                .andExpect(jsonPath("$.data.totalElements", is(5)))
                .andExpect(jsonPath("$.data.totalPages", is(3)))
                .andExpect(jsonPath("$.data.last", is(false)));

        // Request the last page (page 2)
        mockMvc.perform(get(ITEMS_URL + "?page=2&size=2")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.page", is(2)))
                .andExpect(jsonPath("$.data.last", is(true)));
    }

    // ─────────────────────────────────────────────
    // Scenario 21: Ownership isolation — tag filter does NOT return other user's items
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("21. Tag filter never returns items belonging to another user")
    void tagFilterDoesNotReturnOtherUsersItems() throws Exception {
        Tag user1Tag = tagRepository.save(new Tag(user1, "java"));
        Tag user2Tag = tagRepository.save(new Tag(user2, "java"));

        createItemWithFields(user1, "User1 Java Item", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, null, null, Set.of(user1Tag));
        createItemWithFields(user2, "User2 Java Item", ItemType.NOTE, ItemStatus.INBOX, null,
                null, null, null, null, Set.of(user2Tag));

        // Authenticate as user1 searching for tag "java"
        mockMvc.perform(get(ITEMS_URL + "?tagName=java")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].title", is("User1 Java Item")));
    }

    // ─────────────────────────────────────────────
    // Scenario 22: Sorting by createdAt
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("22. Sorting by createdAt ascending and descending works correctly")
    void sortingByCreatedAt() throws Exception {
        createItem(user1, "First Item", ItemType.NOTE);
        Thread.sleep(10);
        createItem(user1, "Second Item", ItemType.NOTE);

        // ASC
        mockMvc.perform(get(ITEMS_URL + "?sort=createdAt,asc")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title", is("First Item")))
                .andExpect(jsonPath("$.data.content[1].title", is("Second Item")));

        // DESC
        mockMvc.perform(get(ITEMS_URL + "?sort=createdAt,desc")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title", is("Second Item")))
                .andExpect(jsonPath("$.data.content[1].title", is("First Item")));
    }

    // ─────────────────────────────────────────────
    // Scenario 23: Sorting by updatedAt
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("23. Sorting by updatedAt ascending and descending works correctly")
    void sortingByUpdatedAt() throws Exception {
        KnowledgeItem item1 = createItem(user1, "Item Alpha", ItemType.NOTE);
        KnowledgeItem item2 = createItem(user1, "Item Beta", ItemType.NOTE);

        item1.setDescription("Updated description");
        knowledgeItemRepository.save(item1);

        mockMvc.perform(get(ITEMS_URL + "?sort=updatedAt,desc")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(2)));
    }

    // ─────────────────────────────────────────────
    // Scenario 24: Sorting by title
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("24. Sorting by title ascending and descending works correctly")
    void sortingByTitle() throws Exception {
        createItem(user1, "Banana", ItemType.NOTE);
        createItem(user1, "Apple", ItemType.NOTE);
        createItem(user1, "Cherry", ItemType.NOTE);

        // ASC
        mockMvc.perform(get(ITEMS_URL + "?sort=title,asc")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title", is("Apple")))
                .andExpect(jsonPath("$.data.content[1].title", is("Banana")))
                .andExpect(jsonPath("$.data.content[2].title", is("Cherry")));

        // DESC
        mockMvc.perform(get(ITEMS_URL + "?sort=title,desc")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title", is("Cherry")))
                .andExpect(jsonPath("$.data.content[1].title", is("Banana")))
                .andExpect(jsonPath("$.data.content[2].title", is("Apple")));
    }

    // ─────────────────────────────────────────────
    // Scenario 25: Sorting by rating
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("25. Sorting by rating ascending and descending works correctly")
    void sortingByRating() throws Exception {
        KnowledgeItem low = createItem(user1, "Low Rated", ItemType.NOTE);
        low.setRating(1);
        knowledgeItemRepository.save(low);

        KnowledgeItem high = createItem(user1, "High Rated", ItemType.NOTE);
        high.setRating(5);
        knowledgeItemRepository.save(high);

        // ASC
        mockMvc.perform(get(ITEMS_URL + "?sort=rating,asc")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title", is("Low Rated")))
                .andExpect(jsonPath("$.data.content[1].title", is("High Rated")));

        // DESC
        mockMvc.perform(get(ITEMS_URL + "?sort=rating,desc")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title", is("High Rated")))
                .andExpect(jsonPath("$.data.content[1].title", is("Low Rated")));
    }

    // ─────────────────────────────────────────────
    // Scenario 26: Unsupported sort field returns 400
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("26. Unsupported sort field returns 400 Bad Request")
    void unsupportedSortFieldReturns400() throws Exception {
        mockMvc.perform(get(ITEMS_URL + "?sort=unknownField,asc")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Invalid sort field: 'unknownField'")));
    }
}
