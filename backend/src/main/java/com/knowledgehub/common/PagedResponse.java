package com.knowledgehub.common;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Paginated response wrapper used by all list endpoints.
 *
 * <p>Wraps Spring Data's {@link Page} into a plain serialisable object
 * so that the API contract is decoupled from Spring's internal page format.
 * Returned inside an {@link ApiResponse} as the {@code data} field.</p>
 *
 * <pre>
 * {
 *   "success": true,
 *   "data": {
 *     "content": [ ... ],
 *     "page": 0,
 *     "size": 20,
 *     "totalElements": 124,
 *     "totalPages": 7,
 *     "last": false
 *   }
 * }
 * </pre>
 *
 * @param <T> the type of items in the page
 */
public class PagedResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean last;

    private PagedResponse(List<T> content, int page, int size,
                          long totalElements, int totalPages, boolean last) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.last = last;
    }

    /**
     * Create a {@code PagedResponse} from a Spring Data {@link Page}.
     *
     * @param page the Spring Data page result
     * @param <T>  the item type
     * @return wrapped paginated response
     */
    public static <T> PagedResponse<T> from(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    // ─────────────────────────────────────────────
    // Getters
    // ─────────────────────────────────────────────

    public List<T> getContent() {
        return content;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public boolean isLast() {
        return last;
    }
}
