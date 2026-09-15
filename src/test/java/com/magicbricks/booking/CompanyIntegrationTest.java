package com.magicbricks.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.magicbricks.booking.domain.Company;
import com.magicbricks.booking.domain.Role;
import com.magicbricks.booking.domain.User;
import com.magicbricks.booking.dto.CompanyRegistrationRequest;
import com.magicbricks.booking.repository.CompanyRepository;
import com.magicbricks.booking.repository.UserRepository;
import com.magicbricks.booking.security.JwtProvider;
import com.magicbricks.booking.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CompanyIntegrationTest {

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

    @Autowired
    private JwtProvider jwtProvider;

    private String superAdminToken;

    @BeforeEach
    public void setUp() {
        User superAdmin = userRepository.findByEmail("superadmin@system.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("superadmin@system.com");
            u.setPasswordHash(passwordEncoder.encode("password123"));
            u.setFullName("System Super Admin");
            u.setRole(Role.SUPER_ADMIN);
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        UserPrincipal principal = UserPrincipal.create(superAdmin);
        superAdminToken = jwtProvider.generateToken(principal);
    }

    @Test
    public void testRegisterCompanySuccess() throws Exception {
        String uniqueCode = "CORP_" + System.currentTimeMillis() % 10000;
        CompanyRegistrationRequest request = new CompanyRegistrationRequest(
                "Apex Global Tech",
                uniqueCode,
                "admin@apexglobal.io",
                "+1-555-0199",
                "77 Silicon Valley Blvd",
                "ACTIVE"
        );

        mockMvc.perform(post("/api/admin/companies")
                .header("Authorization", "Bearer " + superAdminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.companyCode").value(uniqueCode))
                .andExpect(jsonPath("$.data.name").value("Apex Global Tech"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.id").exists());
    }

    @Test
    public void testRegisterCompanyDuplicateCodeFails() throws Exception {
        String uniqueCode = "DUP_" + System.currentTimeMillis() % 10000;
        Company comp = new Company();
        comp.setName("Existing Corp");
        comp.setCompanyCode(uniqueCode);
        comp.setContactInformation("existing@corp.com");
        companyRepository.save(comp);

        CompanyRegistrationRequest request = new CompanyRegistrationRequest(
                "Duplicate Corp",
                uniqueCode,
                "dup@corp.com",
                null,
                null,
                "ACTIVE"
        );

        mockMvc.perform(post("/api/admin/companies")
                .header("Authorization", "Bearer " + superAdminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("BOOKING_CONFLICT"));
    }

    @Test
    public void testRegisterCompanyValidationFailure() throws Exception {
        CompanyRegistrationRequest request = new CompanyRegistrationRequest(
                "", // empty name
                "", // empty code
                "invalid-email", // invalid email
                null,
                null,
                "ACTIVE"
        );

        mockMvc.perform(post("/api/admin/companies")
                .header("Authorization", "Bearer " + superAdminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    public void testGetAllCompanies() throws Exception {
        mockMvc.perform(get("/api/admin/companies")
                .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }
}
