package com.knowledgehub.auth;

import com.knowledgehub.auth.security.UserPrincipal;
import com.knowledgehub.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller used exclusively in test scope to verify protected endpoint
 * access and UserPrincipal injection from SecurityContext.
 */
@RestController
@RequestMapping("/api/v1/test")
public class TestProtectedController {

    @GetMapping("/protected")
    public ResponseEntity<ApiResponse<String>> testProtected(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Access granted", "userId: " + (principal != null ? principal.getUserId() : "null"))
        );
    }

    @GetMapping("/user-id")
    public ResponseEntity<ApiResponse<Long>> getAuthenticatedUserId(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Authenticated user ID retrieved successfully", principal.getUserId())
        );
    }
}
