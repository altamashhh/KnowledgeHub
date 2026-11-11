package com.knowledgehub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a requested resource cannot be found, OR when the
 * resource exists but belongs to another user.
 *
 * <p><strong>Security note:</strong> This single exception covers both
 * "not found" and "not yours" scenarios. The HTTP handler maps it to
 * {@code 404 Not Found} in both cases. This prevents resource enumeration —
 * an attacker cannot determine whether an ID exists under a different
 * user by observing the response status.</p>
 *
 * <p>The repository pattern that enables this:
 * {@code findByIdAndUserId(id, userId)} returns {@code Optional.empty()}
 * regardless of whether the item doesn't exist or belongs to another user.
 * The service throws this exception for {@code Optional.empty()}, and the
 * caller sees 404 in both cases.</p>
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " not found with id: " + id);
    }
}
