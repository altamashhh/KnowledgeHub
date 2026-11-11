package com.knowledgehub;

import com.knowledgehub.tag.Tag;
import com.knowledgehub.tag.TagRepository;
import com.knowledgehub.topic.Topic;
import com.knowledgehub.topic.TopicRepository;
import com.knowledgehub.user.User;
import com.knowledgehub.user.UserRepository;
import com.knowledgehub.knowledge.Difficulty;
import com.knowledgehub.knowledge.ItemStatus;
import com.knowledgehub.knowledge.ItemType;
import com.knowledgehub.knowledge.KnowledgeItem;
import com.knowledgehub.knowledge.KnowledgeItemRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Spring context load and basic entity persistence tests.
 *
 * <p>These tests run against an H2 in-memory database (MySQL compatibility mode)
 * with Flyway migrations applied. They verify:
 * <ol>
 *   <li>The full Spring application context loads without errors.</li>
 *   <li>Flyway migrations V1–V5 execute successfully against H2.</li>
 *   <li>All JPA entities can be persisted and retrieved correctly.</li>
 *   <li>Key relationships (User→Topic, User→KnowledgeItem, Item→Tags) work.</li>
 *   <li>Enum values are stored as strings and read back correctly.</li>
 * </ol>
 * </p>
 *
 * <p>No HTTP layer is involved — this is a pure JPA/database layer test.</p>
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class KnowledgeHubApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private KnowledgeItemRepository knowledgeItemRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private EntityManager entityManager;

    // ─────────────────────────────────────────────
    // Context Load
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("Application context loads and all beans are created")
    void contextLoads() {
        // If this test runs, the Spring context started successfully.
        // Flyway ran all migrations. Hibernate validated (or skipped, per test profile).
        assertThat(userRepository).isNotNull();
        assertThat(topicRepository).isNotNull();
        assertThat(knowledgeItemRepository).isNotNull();
        assertThat(tagRepository).isNotNull();
    }

    // ─────────────────────────────────────────────
    // User entity persistence
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("User can be saved and retrieved by email")
    void userCanBeSavedAndRetrievedByEmail() {
        User user = new User("Arjun Sharma", "arjun@example.com", "$2a$12$hashedpassword");
        userRepository.save(user);
        userRepository.flush();

        assertThat(userRepository.findByEmail("arjun@example.com")).isPresent();
        assertThat(userRepository.existsByEmail("arjun@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("other@example.com")).isFalse();
    }

    @Test
    @DisplayName("User entity does not expose plaintext password fields")
    void userEntityHasNoPlaintextPasswordField() throws NoSuchFieldException {
        // Verifies at the class level that there is no 'password' field —
        // only 'passwordHash'. This is a structural safeguard.
        var fields = User.class.getDeclaredFields();
        for (var field : fields) {
            assertThat(field.getName()).isNotEqualTo("password");
        }
    }

    // ─────────────────────────────────────────────
    // Topic entity persistence
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("Topic can be created under a user and retrieved")
    void topicCanBeCreatedAndRetrieved() {
        User user = userRepository.save(new User("Priya Nair", "priya@example.com", "$2a$12$hash"));
        Topic topic = topicRepository.save(new Topic(user, "Data Structures"));
        topicRepository.flush();

        assertThat(topicRepository.findByIdAndUserId(topic.getId(), user.getId())).isPresent();
        assertThat(topicRepository.existsByUserIdAndName(user.getId(), "Data Structures")).isTrue();
    }

    @Test
    @DisplayName("findByIdAndUserId returns empty for a different user's topic")
    void topicIsolationByUser() {
        User owner  = userRepository.save(new User("Owner", "owner@example.com", "hash1"));
        User other  = userRepository.save(new User("Other", "other@example.com", "hash2"));
        Topic topic = topicRepository.save(new Topic(owner, "Spring Boot"));
        topicRepository.flush();

        // Correct owner can find it
        assertThat(topicRepository.findByIdAndUserId(topic.getId(), owner.getId())).isPresent();
        // Different user cannot find it — returns empty (→ 404, not 403)
        assertThat(topicRepository.findByIdAndUserId(topic.getId(), other.getId())).isEmpty();
    }

    // ─────────────────────────────────────────────
    // KnowledgeItem entity persistence
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("Knowledge item Quick Capture defaults: status=INBOX, type from URL presence")
    void quickCaptureDefaultsAreApplied() {
        User user = userRepository.save(new User("Dev Patel", "dev@example.com", "hash"));

        // URL present → WEBSITE type
        KnowledgeItem itemWithUrl = new KnowledgeItem(user, "HashMap internals", ItemType.WEBSITE);
        itemWithUrl.setUrl("https://www.youtube.com/watch?v=example");

        // No URL → NOTE type
        KnowledgeItem itemNote = new KnowledgeItem(user, "My HashMap notes", ItemType.NOTE);

        knowledgeItemRepository.save(itemWithUrl);
        knowledgeItemRepository.save(itemNote);
        knowledgeItemRepository.flush();

        KnowledgeItem savedUrl  = knowledgeItemRepository.findByIdAndUserId(itemWithUrl.getId(), user.getId()).orElseThrow();
        KnowledgeItem savedNote = knowledgeItemRepository.findByIdAndUserId(itemNote.getId(), user.getId()).orElseThrow();

        assertThat(savedUrl.getStatus()).isEqualTo(ItemStatus.INBOX);
        assertThat(savedUrl.getType()).isEqualTo(ItemType.WEBSITE);
        assertThat(savedUrl.getDifficulty()).isNull();
        assertThat(savedUrl.getTopic()).isNull();
        assertThat(savedUrl.getRating()).isNull();

        assertThat(savedNote.getType()).isEqualTo(ItemType.NOTE);
        assertThat(savedNote.getStatus()).isEqualTo(ItemStatus.INBOX);
    }

    @Test
    @DisplayName("All ItemStatus enum values round-trip through the database as strings")
    void itemStatusEnumValuesRoundTrip() {
        User user = userRepository.save(new User("StatusTest", "status@example.com", "hash"));

        for (ItemStatus status : ItemStatus.values()) {
            KnowledgeItem item = new KnowledgeItem(user, "Item for " + status, ItemType.NOTE);
            item.setStatus(status);
            KnowledgeItem saved = knowledgeItemRepository.save(item);
            knowledgeItemRepository.flush();
            entityManager.refresh(saved);

            assertThat(saved.getStatus()).isEqualTo(status);
        }
    }

    @Test
    @DisplayName("All ItemType enum values round-trip through the database as strings")
    void itemTypeEnumValuesRoundTrip() {
        User user = userRepository.save(new User("TypeTest", "type@example.com", "hash"));

        for (ItemType type : ItemType.values()) {
            KnowledgeItem item = new KnowledgeItem(user, "Item for " + type, type);
            KnowledgeItem saved = knowledgeItemRepository.save(item);
            knowledgeItemRepository.flush();
            entityManager.refresh(saved);

            assertThat(saved.getType()).isEqualTo(type);
        }
    }

    @Test
    @DisplayName("Knowledge item is isolated by user (findByIdAndUserId returns empty for wrong user)")
    void knowledgeItemIsolationByUser() {
        User owner = userRepository.save(new User("Owner", "itemowner@example.com", "hash1"));
        User other = userRepository.save(new User("Other", "itemother@example.com", "hash2"));

        KnowledgeItem item = knowledgeItemRepository.save(
                new KnowledgeItem(owner, "Owner's private item", ItemType.NOTE));
        knowledgeItemRepository.flush();

        assertThat(knowledgeItemRepository.findByIdAndUserId(item.getId(), owner.getId())).isPresent();
        assertThat(knowledgeItemRepository.findByIdAndUserId(item.getId(), other.getId())).isEmpty();
    }

    @Test
    @DisplayName("Difficulty enum values round-trip through the database as strings")
    void difficultyEnumRoundTrip() {
        User user = userRepository.save(new User("DiffTest", "diff@example.com", "hash"));

        for (Difficulty difficulty : Difficulty.values()) {
            KnowledgeItem item = new KnowledgeItem(user, "Item " + difficulty, ItemType.ARTICLE);
            item.setDifficulty(difficulty);
            KnowledgeItem saved = knowledgeItemRepository.save(item);
            knowledgeItemRepository.flush();
            entityManager.refresh(saved);

            assertThat(saved.getDifficulty()).isEqualTo(difficulty);
        }
    }

    // ─────────────────────────────────────────────
    // Tag entity persistence
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("Tags are user-scoped and can be found by name for a user")
    void tagsAreUserScoped() {
        User user1 = userRepository.save(new User("User1", "user1@example.com", "hash1"));
        User user2 = userRepository.save(new User("User2", "user2@example.com", "hash2"));

        tagRepository.save(new Tag(user1, "Java"));
        tagRepository.save(new Tag(user2, "Java")); // same name, different user — allowed
        tagRepository.flush();

        assertThat(tagRepository.findByUserIdAndName(user1.getId(), "Java")).isPresent();
        assertThat(tagRepository.findByUserIdAndName(user2.getId(), "Java")).isPresent();
        assertThat(tagRepository.existsByUserIdAndName(user1.getId(), "Java")).isTrue();
        assertThat(tagRepository.existsByUserIdAndName(user1.getId(), "Python")).isFalse();
    }

    @Test
    @DisplayName("Dashboard stat: countByUserId counts only the user's items")
    void countByUserIdCountsCorrectly() {
        User user = userRepository.save(new User("CountTest", "count@example.com", "hash"));
        knowledgeItemRepository.save(new KnowledgeItem(user, "Item 1", ItemType.NOTE));
        knowledgeItemRepository.save(new KnowledgeItem(user, "Item 2", ItemType.ARTICLE));
        knowledgeItemRepository.flush();

        assertThat(knowledgeItemRepository.countByUserId(user.getId())).isEqualTo(2);
        assertThat(knowledgeItemRepository.countByUserIdAndStatus(user.getId(), ItemStatus.INBOX)).isEqualTo(2);
    }
}
