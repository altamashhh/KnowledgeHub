package com.knowledgehub.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entities.
 *
 * <p>All queries are automatically scoped to the table. Cross-user data
 * isolation is enforced in the Service layer — callers must pass
 * the authenticated user's ID to service methods.</p>
 *
 * <p>Methods added here will be expanded in Phase 2 (Authentication).</p>
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their unique email address.
     * Used during login to look up the user for credential verification.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check whether an email address is already registered.
     * Used during registration to detect duplicate accounts.
     */
    boolean existsByEmail(String email);
}
