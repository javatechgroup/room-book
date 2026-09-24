package com.javatechgroup.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatechgroup.booking.domain.Company;
import com.javatechgroup.booking.domain.Role;
import com.javatechgroup.booking.domain.Room;
import com.javatechgroup.booking.domain.User;
import com.javatechgroup.booking.dto.FloorRequest;
import com.javatechgroup.booking.repository.CompanyRepository;
import com.javatechgroup.booking.repository.FloorRepository;
import com.javatechgroup.booking.repository.RoomRepository;
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
public class FacilityFloorIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private FloorRepository floorRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    private String adminToken;
    private Company testCompany;

    @BeforeEach
    public void setUp() {
        testCompany = companyRepository.findByCompanyCode("FLOOR_TEST_CORP").orElseGet(() -> {
            Company c = new Company();
            c.setName("Floor Test Corp");
            c.setCompanyCode("FLOOR_TEST_CORP");
            c.setContactInformation("flooradmin@testcorp.com");
            c.setStatus("ACTIVE");
            return companyRepository.save(c);
        });

        User facilityAdmin = userRepository.findByEmail("flooradmin@testcorp.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("flooradmin@testcorp.com");
            u.setPasswordHash(passwordEncoder.encode("password123"));
            u.setFullName("Floor Facility Admin");
            u.setRole(Role.COMPANY_ADMIN);
            u.setCompany(testCompany);
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        UserPrincipal principal = UserPrincipal.create(facilityAdmin);
        adminToken = jwtProvider.generateToken(principal);
    }

    @Test
    public void testCreateFloorSuccess() throws Exception {
        String uniqueName = "Floor Level " + System.currentTimeMillis() % 10000;
        FloorRequest request = new FloorRequest(uniqueName, 2, "Test Floor for Marketing", "ACTIVE");

        mockMvc.perform(post("/api/facility/floors")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value(uniqueName))
                .andExpect(jsonPath("$.data.floorNumber").value(2))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.id").exists());
    }

    @Test
    public void testCreateDuplicateFloorFails() throws Exception {
        String dupName = "Dup Floor " + System.currentTimeMillis() % 10000;
        FloorRequest request = new FloorRequest(dupName, 1, "First creation", "ACTIVE");

        mockMvc.perform(post("/api/facility/floors")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate attempt
        mockMvc.perform(post("/api/facility/floors")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("BOOKING_CONFLICT"));
    }

    @Test
    public void testGetFloorsPaginated() throws Exception {
        mockMvc.perform(get("/api/facility/floors?page=1&size=5&status=ALL")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.page").value(1));
    }

    @Test
    public void testGetAllActiveFloors() throws Exception {
        mockMvc.perform(get("/api/facility/floors/all")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    public void testDeleteFloorWithRoomsFails() throws Exception {
        String floorWithRoom = "Floor With Room " + System.currentTimeMillis() % 10000;
        FloorRequest request = new FloorRequest(floorWithRoom, 3, "Has room", "ACTIVE");

        String res = mockMvc.perform(post("/api/facility/floors")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long floorId = objectMapper.readTree(res).path("data").path("id").asLong();

        // Create a room on this floor
        Room r = new Room();
        r.setCompany(testCompany);
        r.setName("Meeting Room On " + floorWithRoom);
        r.setFloor(floorWithRoom);
        r.setCapacity(8);
        r.setStatus("AVAILABLE");
        roomRepository.save(r);

        // Deleting floor should fail
        mockMvc.perform(delete("/api/facility/floors/" + floorId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("BOOKING_CONFLICT"));
    }
}
