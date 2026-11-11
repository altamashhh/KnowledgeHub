package com.knowledgehub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a client requests sorting by a field that is not on the
 * explicit allow-list of supported sort properties.
 *
 * <p>This exception prevents unsupported property names from reaching the
 * JPA layer, where they would cause an opaque 500 error or, more importantly,
 * could be misused to probe the entity model. The global exception handler
 * maps this to HTTP 400 Bad Request.</p>
 *
 * <p>Supported sort fields: {@code createdAt}, {@code updatedAt},
 * {@code title}, {@code rating}.</p>
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidSortFieldException extends RuntimeException {

    public InvalidSortFieldException(String field, Iterable<String> allowedFields) {
        super("Invalid sort field: '" + field + "'. Supported sort fields: " + allowedFields);
    }
}
