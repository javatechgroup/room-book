package com.javatechgroup.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatechgroup.booking.domain.Company;
import com.javatechgroup.booking.domain.Role;
import com.javatechgroup.booking.domain.User;
import com.javatechgroup.booking.dto.CompanyRegistrationRequest;
import com.javatechgroup.booking.repository.CompanyRepository;
import com.javatechgroup.booking.repository.UserRepository;
import com.javatechgroup.booking.security.JwtProvider;
import com.javatechgroup.booking.security.UserPrincipal;
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
    public void testGetAllCompaniesPaginated() throws Exception {
        mockMvc.perform(get("/api/admin/companies?page=1&size=5&status=ALL")
                .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.size").value(5))
                .andExpect(jsonPath("$.data.totalElements").isNumber())
                .andExpect(jsonPath("$.data.totalPages").isNumber());
    }
}
