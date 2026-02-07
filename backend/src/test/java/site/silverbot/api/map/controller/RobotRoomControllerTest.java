package site.silverbot.api.map.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.robot.Room;
import site.silverbot.domain.robot.RoomRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class RobotRoomControllerTest extends RestDocsSupport {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private RoomRepository roomRepository;

    private User user;
    private Elder elder;
    private Robot robot;

    @BeforeEach
    void setUp() {
        roomRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        user = userRepository.save(User.builder()
                .name("김복지")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());
        elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .status(ElderStatus.SAFE)
                .build());
        robot = robotRepository.save(Robot.builder()
                .elder(elder)
                .serialNumber("ROBOT-ROOM-002")
                .networkStatus(NetworkStatus.CONNECTED)
                .currentLocation("LIVING_ROOM")
                .currentX(450f)
                .currentY(150f)
                .currentHeading(30)
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getRooms_returnsList() throws Exception {
        roomRepository.save(Room.builder()
                .robot(robot)
                .roomId("LIVING_ROOM")
                .name("거실")
                .x(300f)
                .y(0f)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/robots/{robotId}/rooms", robot.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rooms.length()").value(1))
                .andExpect(jsonPath("$.data.rooms[0].id").value("LIVING_ROOM"))
                .andDo(document("robot-room-list"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createRoom_usesCurrentLocationWhenRequested() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "거실",
                "useCurrentLocation", true
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/rooms", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("ROOM_1"))
                .andExpect(jsonPath("$.data.x").value(450.0))
                .andExpect(jsonPath("$.data.y").value(150.0))
                .andDo(document("robot-room-create-current-location"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createRoom_returnsConflictWhenRoomIdAlreadyExists() throws Exception {
        roomRepository.save(Room.builder()
                .robot(robot)
                .roomId("LIVING_ROOM")
                .name("거실")
                .x(300f)
                .y(0f)
                .build());

        Map<String, Object> request = Map.of(
                "id", "living_room",
                "name", "거실",
                "x", 450.0,
                "y", 150.0,
                "useCurrentLocation", false
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/rooms", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("CONFLICT"))
                .andDo(document("robot-room-create-conflict"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateRoom_updatesName() throws Exception {
        roomRepository.save(Room.builder()
                .robot(robot)
                .roomId("BEDROOM")
                .name("작은방")
                .x(120f)
                .y(80f)
                .build());

        Map<String, Object> request = Map.of("name", "안방");

        mockMvc.perform(RestDocumentationRequestBuilders.put("/api/robots/{robotId}/rooms/{roomId}", robot.getId(), "BEDROOM")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("BEDROOM"))
                .andExpect(jsonPath("$.data.name").value("안방"))
                .andDo(document("robot-room-update"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void deleteRoom_returnsNoContent() throws Exception {
        roomRepository.save(Room.builder()
                .robot(robot)
                .roomId("KITCHEN")
                .name("주방")
                .x(400f)
                .y(220f)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.delete("/api/robots/{robotId}/rooms/{roomId}", robot.getId(), "KITCHEN"))
                .andExpect(status().isNoContent())
                .andDo(document("robot-room-delete"));
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void getRooms_returnsForbiddenForOtherUser() throws Exception {
        userRepository.save(User.builder()
                .name("다른 유저")
                .email("other@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/robots/{robotId}/rooms", robot.getId()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"))
                .andDo(document("robot-room-forbidden"));
    }
}
