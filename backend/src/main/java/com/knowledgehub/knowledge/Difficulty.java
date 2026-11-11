package com.knowledgehub.knowledge;

/**
 * Difficulty level of a Knowledge Item.
 *
 * <p>Stored as a VARCHAR column via {@code @Enumerated(EnumType.STRING)}.
 * This field is nullable — it is not set at Quick Capture time and is
 * only populated during progressive enrichment.</p>
 */
public enum Difficulty {

    /** Suitable for beginners with little or no prior knowledge. */
    BEGINNER,

    /** Requires some background knowledge of the topic. */
    INTERMEDIATE,

    /** Deep or complex content requiring solid foundational understanding. */
    ADVANCED
}
