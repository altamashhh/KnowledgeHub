package com.knowledgehub.auth.security;

import com.knowledgehub.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Spring Security {@link UserDetails} adapter.
 *
 * <p>Wraps the domain {@link User} entity without coupling the entity class
 * to Spring Security interfaces. Holds the authenticated user's ID, email,
 * and hashed password.</p>
 *
 * <p>Services can retrieve the authenticated user ID via:
 * <pre>
 *   UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext()
 *           .getAuthentication().getPrincipal();
 *   Long userId = principal.getUserId();
 * </pre>
 * </p>
 */
public class UserPrincipal implements UserDetails {

    private final Long userId;
    private final String email;
    private final String passwordHash;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long userId, String email, String passwordHash) {
        this.userId = userId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    public static UserPrincipal create(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash()
        );
    }

    public Long getUserId() {
        return userId;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
