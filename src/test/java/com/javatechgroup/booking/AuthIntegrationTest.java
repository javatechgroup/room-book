package com.javatechgroup.booking;

import com.javatechgroup.booking.auth.LoginRequest;
import com.javatechgroup.booking.domain.Company;
import com.javatechgroup.booking.domain.Role;
import com.javatechgroup.booking.domain.User;
import com.javatechgroup.booking.repository.CompanyRepository;
import com.javatechgroup.booking.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    public void setUp() {
        userRepository.findByEmail("superadmin@system.com").ifPresent(user -> {
            user.setPasswordHash(passwordEncoder.encode("password123"));
            userRepository.save(user);
        });

        Company testCompany = companyRepository.findByCompanyCode("TEST_CORP").orElseGet(() -> {
            Company c = new Company();
            c.setName("Test Corp");
            c.setCompanyCode("TEST_CORP");
            c.setContactInformation("admin@testcorp.com");
            c.setStatus("ACTIVE");
            return companyRepository.save(c);
        });

        userRepository.findByEmail("admin@testcorp.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("admin@testcorp.com");
            u.setPasswordHash(passwordEncoder.encode("password123"));
            u.setFullName("Test Admin");
            u.setRole(Role.COMPANY_ADMIN);
            u.setCompany(testCompany);
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });
    }

    @Test
    public void testSuccessfulLoginAsSuperAdmin() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("superadmin@system.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("superadmin@system.com"))
                .andExpect(jsonPath("$.data.role").value("SUPER_ADMIN"))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }

    @Test
    public void testSuccessfulLoginAsCompanyAdmin() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@testcorp.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("admin@testcorp.com"))
                .andExpect(jsonPath("$.data.role").value("COMPANY_ADMIN"))
                .andExpect(jsonPath("$.data.companyId").exists());
    }

    @Test
    public void testInvalidLoginCredentials() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("superadmin@system.com");
        loginRequest.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }
}
