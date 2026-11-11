package com.knowledgehub.knowledge;

/**
 * Semantic type of a Knowledge Item.
 *
 * <p>Stored as a VARCHAR column via {@code @Enumerated(EnumType.STRING)}.
 * Adding a new type value requires only a Java code change — no database
 * migration is needed because the column is a plain VARCHAR.</p>
 *
 * <h3>Quick Capture Defaults (enforced in service layer):</h3>
 * <ul>
 *   <li>URL provided → default {@code WEBSITE}</li>
 *   <li>Text content only (no URL) → default {@code NOTE}</li>
 * </ul>
 */
public enum ItemType {

    /** A personal free-text or markdown note with no external URL. */
    NOTE,

    /** An online article, blog post, or written resource. */
    ARTICLE,

    /** A YouTube video or any video resource. */
    VIDEO,

    /** A PDF document, whitepaper, or downloadable file. */
    PDF,

    /** A general website or web page (default for URL capture). */
    WEBSITE,

    /** A GitHub repository, gist, or code project. */
    GITHUB_REPO,

    /** A code snippet, algorithm, or implementation example. */
    CODE_SNIPPET,

    /** An interview question with an expected answer or explanation. */
    INTERVIEW_QUESTION
}
