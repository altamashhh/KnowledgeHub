package com.knowledgehub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown during login when credentials (email or password) are invalid.
 * Uses the exact same message "Invalid credentials" regardless of whether
 * the email was not found or the password was incorrect, preventing user enumeration.
 * Maps to HTTP 401 Unauthorized.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid credentials");
    }
}
