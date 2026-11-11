package com.knowledgehub.auth.service;

import com.knowledgehub.auth.dto.AuthResponse;
import com.knowledgehub.auth.dto.LoginRequest;
import com.knowledgehub.auth.dto.RegisterRequest;
import com.knowledgehub.auth.dto.UserResponse;
import com.knowledgehub.auth.security.JwtUtil;
import com.knowledgehub.exception.EmailAlreadyExistsException;
import com.knowledgehub.exception.InvalidCredentialsException;
import com.knowledgehub.user.User;
import com.knowledgehub.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service encapsulating authentication business logic (Registration & Login).
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Register a new KnowledgeHub user.
     *
     * @param request registration request containing name, email, and raw password
     * @return safe user response profile (no password hash)
     * @throws EmailAlreadyExistsException if email is already registered (409 Conflict)
     */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getName(), request.getEmail(), passwordHash);
        User savedUser = userRepository.save(user);

        return UserResponse.fromEntity(savedUser);
    }

    /**
     * Authenticate a user and issue a JWT token upon successful verification.
     *
     * @param request login request containing email and raw password
     * @return authentication response with JWT token, expiration timestamp, and safe user profile
     * @throws InvalidCredentialsException if email not found OR password mismatch (401 Unauthorized)
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        LocalDateTime expiresAt = jwtUtil.extractExpiration(token);

        return new AuthResponse(token, expiresAt, UserResponse.fromEntity(user));
    }
}
