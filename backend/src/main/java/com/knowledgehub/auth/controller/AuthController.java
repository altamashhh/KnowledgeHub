package com.knowledgehub.auth.controller;

import com.knowledgehub.auth.dto.AuthResponse;
import com.knowledgehub.auth.dto.LoginRequest;
import com.knowledgehub.auth.dto.RegisterRequest;
import com.knowledgehub.auth.dto.UserResponse;
import com.knowledgehub.auth.service.AuthService;
import com.knowledgehub.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for authentication endpoints:
 * <ul>
 *   <li>{@code POST /api/v1/auth/register} — Register a new user</li>
 *   <li>{@code POST /api/v1/auth/login} — Authenticate user and obtain JWT token</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        UserResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    /**
     * Authenticate a user and issue a JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);

        return ResponseEntity
                .ok(ApiResponse.success("Login successful", response));
    }
}
