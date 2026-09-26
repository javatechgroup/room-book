package com.javatechgroup.booking.auth;

import com.javatechgroup.booking.domain.AuditLog;
import com.javatechgroup.booking.domain.PasswordResetToken;
import com.javatechgroup.booking.domain.User;
import com.javatechgroup.booking.notification.email.EmailService;
import com.javatechgroup.booking.repository.AuditLogRepository;
import com.javatechgroup.booking.repository.PasswordResetTokenRepository;
import com.javatechgroup.booking.repository.UserRepository;
import com.javatechgroup.booking.security.JwtProvider;
import com.javatechgroup.booking.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditLogRepository auditLogRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtProvider jwtProvider,
                       UserRepository userRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       AuditLogRepository auditLogRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.auditLogRepository = auditLogRepository;
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String jwt = jwtProvider.generateToken(userPrincipal);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + loginRequest.getEmail()));

        AuthResponse response = new AuthResponse();
        response.setAccessToken(jwt);
        response.setTokenType("Bearer");
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
        response.setRole(user.getRole());

        return response;
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return;
        }

        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Return silently so malicious callers cannot enumerate registered corporate emails
            return;
        }

        User user = userOpt.get();
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            return;
        }

        // Invalidate any previously generated active tokens for this user
        passwordResetTokenRepository.invalidateAllActiveTokensForUser(user);

        // Generate a new cryptographically random token with 30-minute expiry
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(30);

        PasswordResetToken resetToken = new PasswordResetToken(user, token, expiryDate);
        passwordResetTokenRepository.save(resetToken);

        // Dispatch simulated/real notification
        emailService.sendPasswordResetEmail(user, token, expiryDate);

        // Record audit trail
        AuditLog audit = new AuditLog();
        audit.setUserId(user.getId());
        if (user.getCompany() != null) {
            audit.setCompanyId(user.getCompany().getId());
        }
        audit.setAction("PASSWORD_RESET_REQUESTED");
        audit.setEntityType("USER");
        audit.setEntityId(user.getId());
        audit.setNewValue("Password reset token generated for email: " + user.getEmail());
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);
    }

    @Transactional(readOnly = true)
    public boolean verifyResetToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token.trim());
        if (tokenOpt.isEmpty()) {
            return false;
        }
        PasswordResetToken resetToken = tokenOpt.get();
        return !Boolean.TRUE.equals(resetToken.getUsed()) && !resetToken.isExpired();
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String token = request.getToken() != null ? request.getToken().trim() : "";
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or non-existent password reset token."));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new IllegalStateException("This password reset token has already been used. Please request a new one.");
        }

        if (resetToken.isExpired()) {
            throw new IllegalStateException("This password reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        if (user == null) {
            throw new IllegalStateException("Associated user account not found.");
        }

        // Securely hash and update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
        userRepository.save(user);

        // Mark token as consumed
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Record audit trail
        AuditLog audit = new AuditLog();
        audit.setUserId(user.getId());
        if (user.getCompany() != null) {
            audit.setCompanyId(user.getCompany().getId());
        }
        audit.setAction("PASSWORD_RESET_COMPLETED");
        audit.setEntityType("USER");
        audit.setEntityId(user.getId());
        audit.setNewValue("Password successfully reset using recovery token for: " + user.getEmail());
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);
    }
}
