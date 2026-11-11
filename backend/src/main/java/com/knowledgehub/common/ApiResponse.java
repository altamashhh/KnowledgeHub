package com.knowledgehub.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * Standard API response envelope used by all endpoints.
 *
 * <p>Every response — success or error — uses this shape, so the frontend
 * always knows what to expect regardless of which endpoint was called.</p>
 *
 * <pre>
 * {
 *   "success": true,
 *   "message": "Knowledge item created successfully",
 *   "data": { ... },
 *   "timestamp": "2026-08-14T10:00:00"
 * }
 * </pre>
 *
 * <p>{@code data} is omitted from the JSON output when null (e.g., error responses)
 * using {@code @JsonInclude(JsonInclude.Include.NON_NULL)}.</p>
 *
 * @param <T> the type of the response payload
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;
    private final LocalDateTime timestamp;

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    // ─────────────────────────────────────────────
    // Static factory methods
    // ─────────────────────────────────────────────

    /** Create a success response with a data payload. */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /** Create a success response with no data payload (e.g., delete operations). */
    public static <Void> ApiResponse<Void> success(String message) {
        return new ApiResponse<>(true, message, null);
    }

    /** Create an error response with no data payload. */
    public static <Void> ApiResponse<Void> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    // ─────────────────────────────────────────────
    // Getters
    // ─────────────────────────────────────────────

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
