package com.javatechgroup.booking.auth;

import com.javatechgroup.booking.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success(null, "If an account matches that email address, password reset instructions have been sent."));
    }

    @GetMapping("/verify-reset-token")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> verifyResetToken(@RequestParam String token) {
        boolean valid = authService.verifyResetToken(token);
        return ResponseEntity.ok(ApiResponse.success(Map.of("valid", valid), valid ? "Reset token is valid." : "Reset token is invalid or expired."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password has been reset successfully. You may now sign in with your new password."));
    }
}
