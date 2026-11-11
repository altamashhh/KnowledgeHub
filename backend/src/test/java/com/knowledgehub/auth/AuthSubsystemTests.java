package com.knowledgehub.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowledgehub.auth.dto.LoginRequest;
import com.knowledgehub.auth.dto.RegisterRequest;
import com.knowledgehub.auth.security.JwtUtil;
import com.knowledgehub.auth.security.UserPrincipal;
import com.knowledgehub.common.ApiResponse;
import com.knowledgehub.user.User;
import com.knowledgehub.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;



/**
 * End-to-end integration test suite for MVP-1 Phase 2 Authentication subsystem.
 *
 * <p>Verifies:
 * <ol>
 *   <li>Successful registration (201 Created, safe response)</li>
 *   <li>Duplicate email registration (409 Conflict)</li>
 *   <li>Invalid registration input (400 Bad Request)</li>
 *   <li>Password BCrypt hashing verification</li>
 *   <li>Successful login issuing valid JWT (200 OK)</li>
 *   <li>Wrong password login failure (401 Unauthorized, "Invalid credentials")</li>
 *   <li>Unknown email login failure (401 Unauthorized, "Invalid credentials")</li>
 *   <li>JWT token generation</li>
 *   <li>JWT token validation and tampering rejection</li>
 *   <li>Protected endpoint rejection without Bearer token</li>
 *   <li>Authenticated user identity extraction and SecurityContext establishment</li>
 * </ol>
 * </p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthSubsystemTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    // ─────────────────────────────────────────────
    // 1. Successful Registration
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("1. Registration succeeds with valid data (returns 201 Created and safe user response)")
    void successfulRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest("Vikram Seth", "vikram@example.com", "securePass123");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("User registered successfully")))
                .andExpect(jsonPath("$.data.id", notNullValue()))
                .andExpect(jsonPath("$.data.name", is("Vikram Seth")))
                .andExpect(jsonPath("$.data.email", is("vikram@example.com")))
                .andExpect(jsonPath("$.data.password").doesNotExist())
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());

        assertThat(userRepository.findByEmail("vikram@example.com")).isPresent();
    }

    // ─────────────────────────────────────────────
    // 2. Duplicate Email Registration
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("2. Duplicate email registration returns 409 Conflict")
    void duplicateEmailRegistrationReturns409() throws Exception {
        RegisterRequest request = new RegisterRequest("User One", "dup@example.com", "password123");

        // First registration
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate registration attempt
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("dup@example.com")));
    }

    // ─────────────────────────────────────────────
    // 3. Invalid Registration Data
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("3. Invalid registration data (short password, invalid email) returns 400 Bad Request")
    void invalidRegistrationDataReturns400() throws Exception {
        // Password too short (< 8 chars) and invalid email format
        RegisterRequest request = new RegisterRequest("", "invalid-email", "short");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.data", notNullValue()));
    }

    // ─────────────────────────────────────────────
    // 4. Password BCrypt Hashing
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("4. Password is stored strictly as a BCrypt hash, never as plaintext")
    void passwordIsStoredAsBcryptHash() throws Exception {
        String rawPassword = "mySuperSecretPassword123";
        RegisterRequest request = new RegisterRequest("Hash Test User", "hash@example.com", rawPassword);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail("hash@example.com").orElseThrow();

        assertThat(user.getPasswordHash()).isNotEqualTo(rawPassword);
        assertThat(user.getPasswordHash()).startsWith("$2a$");
        assertThat(passwordEncoder.matches(rawPassword, user.getPasswordHash())).isTrue();
    }

    // ─────────────────────────────────────────────
    // 5. Successful Login
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("5. Successful login returns 200 OK with valid JWT token and user profile")
    void successfulLogin() throws Exception {
        // Register first
        RegisterRequest regRequest = new RegisterRequest("Login User", "login@example.com", "password123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated());

        // Login
        LoginRequest loginRequest = new LoginRequest("login@example.com", "password123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.data.expiresAt", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("login@example.com")));
    }

    // ─────────────────────────────────────────────
    // 6. Wrong Password Login
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("6. Login with wrong password returns 401 Unauthorized with 'Invalid credentials'")
    void wrongPasswordLoginReturns401() throws Exception {
        RegisterRequest regRequest = new RegisterRequest("Wrong Pass User", "wrongpass@example.com", "correctPass123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest("wrongpass@example.com", "WRONGPass123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid credentials")));
    }

    // ─────────────────────────────────────────────
    // 7. Unknown Email Login
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("7. Login with unknown email returns 401 Unauthorized with identical 'Invalid credentials' message")
    void unknownEmailLoginReturns401() throws Exception {
        LoginRequest loginRequest = new LoginRequest("nonexistent@example.com", "anyPassword123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid credentials")));
    }

    // ─────────────────────────────────────────────
    // 8. JWT Generation
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("8. JwtUtil generates valid token containing userId and email claims")
    void jwtGeneration() {
        Long userId = 42L;
        String email = "jwt@example.com";

        String token = jwtUtil.generateToken(userId, email);

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtUtil.extractEmail(token)).isEqualTo(email);
    }

    // ─────────────────────────────────────────────
    // 9. JWT Validation
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("9. JwtUtil correctly validates valid tokens and rejects tampered tokens")
    void jwtValidation() {
        String token = jwtUtil.generateToken(99L, "valid@example.com");

        assertThat(jwtUtil.validateToken(token)).isTrue();
        assertThat(jwtUtil.validateToken(token + "tampered")).isFalse();
        assertThat(jwtUtil.validateToken("invalid.jwt.structure")).isFalse();
    }

    // ─────────────────────────────────────────────
    // 10. Protected Endpoint Rejects Unauthenticated Requests
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("10. Protected endpoint rejects requests missing Authorization Bearer token with 403/401")
    void protectedEndpointRejectsUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/api/v1/test/protected"))
                .andExpect(status().isForbidden());
    }

    // ─────────────────────────────────────────────
    // 11. Authenticated User Identity Established
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("11. Valid Bearer JWT establishes SecurityContext and authenticated UserPrincipal")
    void authenticatedUserIdentityEstablished() throws Exception {
        // Create user
        User user = userRepository.save(new User("Auth Test", "authtest@example.com", passwordEncoder.encode("pass")));

        // Generate JWT
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        // Access protected endpoint with Bearer token
        mockMvc.perform(get("/api/v1/test/protected")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", containsString("userId: " + user.getId())));
    }
}
