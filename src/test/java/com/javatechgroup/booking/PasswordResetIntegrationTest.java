package com.javatechgroup.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatechgroup.booking.auth.ForgotPasswordRequest;
import com.javatechgroup.booking.auth.LoginRequest;
import com.javatechgroup.booking.auth.ResetPasswordRequest;
import com.javatechgroup.booking.domain.PasswordResetToken;
import com.javatechgroup.booking.domain.User;
import com.javatechgroup.booking.notification.email.DummyEmailService;
import com.javatechgroup.booking.repository.PasswordResetTokenRepository;
import com.javatechgroup.booking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class PasswordResetIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DummyEmailService dummyEmailService;

    private User testUser;

    @BeforeEach
    public void setUp() {
        dummyEmailService.clearSentEmails();

        testUser = userRepository.findByEmail("reset_tester@system.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("reset_tester@system.com");
            u.setFullName("Reset Tester");
            u.setPasswordHash(passwordEncoder.encode("oldPassword123"));
            u.setRole(com.javatechgroup.booking.domain.Role.EMPLOYEE);
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        // Reset user password to known state
        testUser.setPasswordHash(passwordEncoder.encode("oldPassword123"));
        userRepository.save(testUser);
        passwordResetTokenRepository.deleteAll();
    }

    @Test
    public void testCompletePasswordResetLifecycle() throws Exception {
        // 1. Request password reset
        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest("reset_tester@system.com");
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify token in DB
        List<PasswordResetToken> tokens = passwordResetTokenRepository.findByUserAndUsedFalse(testUser);
        assertThat(tokens).hasSize(1);
        String resetToken = tokens.get(0).getToken();
        assertThat(resetToken).isNotBlank();

        // Verify email was simulated
        assertThat(dummyEmailService.getSentEmailCount()).isGreaterThan(0);

        // 2. Verify token is valid
        mockMvc.perform(get("/api/auth/verify-reset-token")
                        .param("token", resetToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid").value(true));

        // 3. Reset password with new password
        ResetPasswordRequest resetReq = new ResetPasswordRequest(resetToken, "NewPass456!");
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Token should now be marked as used
        PasswordResetToken usedToken = passwordResetTokenRepository.findByToken(resetToken).orElseThrow();
        assertThat(usedToken.getUsed()).isTrue();

        // 4. Verify token is now reported as invalid
        mockMvc.perform(get("/api/auth/verify-reset-token")
                        .param("token", resetToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid").value(false));

        // 5. Old password should fail login
        LoginRequest oldLoginReq = new LoginRequest("reset_tester@system.com", "oldPassword123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oldLoginReq)))
                .andExpect(status().isUnauthorized());

        // 6. New password should succeed login
        LoginRequest newLoginReq = new LoginRequest("reset_tester@system.com", "NewPass456!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLoginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    public void testForgotPasswordWithNonExistentEmailReturnsGenericSuccess() throws Exception {
        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest("nonexistent@domain.com");
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertThat(dummyEmailService.getSentEmailCount()).isEqualTo(0);
    }
}
