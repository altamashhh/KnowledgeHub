package com.knowledgehub.knowledge;

/**
 * Learning lifecycle status of a Knowledge Item.
 *
 * <p>Stored as a VARCHAR column via {@code @Enumerated(EnumType.STRING)}.
 * The value {@code INBOX} is the system default applied at Quick Capture time.</p>
 *
 * <h3>Lifecycle:</h3>
 * <pre>
 *   INBOX → TO_LEARN → IN_PROGRESS → UNDERSTOOD → REVIEWED
 * </pre>
 *
 * <p>Transitions are not enforced by the application — users can set any
 * status at any time. This is a personal tool, not a workflow engine.</p>
 */
public enum ItemStatus {

    /**
     * Item just captured. Not yet classified or enriched.
     * Applied automatically by the system on Quick Capture.
     */
    INBOX,

    /**
     * Item has been reviewed and queued for study.
     * Enriched with topic/tags but not yet started.
     */
    TO_LEARN,

    /**
     * User has begun actively studying this item.
     */
    IN_PROGRESS,

    /**
     * User considers this concept learned.
     */
    UNDERSTOOD,

    /**
     * User has revisited and confirmed understanding (e.g., before an interview).
     * Sets {@code lastReviewedAt} timestamp.
     */
    REVIEWED
}
