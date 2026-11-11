package com.knowledgehub.exception;

import com.knowledgehub.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Global exception handler — ensures all errors produce a consistent
 * JSON response envelope regardless of where the exception originates.
 *
 * <p>Every response uses {@link ApiResponse} so clients always receive
 * the same shape: {@code { success, message, data, errors, timestamp }}.</p>
 *
 * <p>Additional handlers (e.g., authentication exceptions, conflict exceptions)
 * will be added in later phases as new features are implemented.</p>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles resource-not-found exceptions.
     * Returns 404. Used for both "item doesn't exist" and "item belongs
     * to another user" — see {@link ResourceNotFoundException} javadoc.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handles Bean Validation failures (e.g., @NotBlank, @Size violations
     * on request DTOs annotated with @Valid).
     * Returns 400 with a list of all field errors.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<List<String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());

        ApiResponse<List<String>> response = new ApiResponse<>(false, "Validation failed", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles duplicate email registration attempts.
     * Returns 409 Conflict.
     */
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handles invalid login attempts (wrong email or wrong password).
     * Returns 401 Unauthorized with "Invalid credentials".
     */
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handles malformed JSON requests or unparseable enum values.
     * Returns 400 Bad Request.
     */
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(
            org.springframework.http.converter.HttpMessageNotReadableException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Malformed JSON request or invalid enum value"));
    }

    /**
     * Handles requests to sort by a field not on the supported allow-list.
     * Returns 400 Bad Request.
     */
    @ExceptionHandler(InvalidSortFieldException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidSortField(InvalidSortFieldException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Catch-all handler for unexpected exceptions.
     * Returns 500. The message is intentionally generic to avoid leaking
     * implementation details to the client.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred. Please try again."));
    }
}
