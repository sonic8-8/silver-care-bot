package site.silverbot.api.map.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
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
import site.silverbot.domain.robot.RoomType;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class ElderMapControllerTest extends RestDocsSupport {

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
                .serialNumber("ROBOT-ROOM-001")
                .networkStatus(NetworkStatus.CONNECTED)
                .currentLocation("LIVING_ROOM")
                .currentX(450f)
                .currentY(150f)
                .currentHeading(45)
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getMap_returnsMapPayload() throws Exception {
        roomRepository.save(Room.builder()
                .robot(robot)
                .roomId("LIVING_ROOM")
                .name("거실")
                .x(300f)
                .y(0f)
                .roomType(RoomType.LIVING_ROOM)
                .build());
        roomRepository.save(Room.builder()
                .robot(robot)
                .roomId("KITCHEN")
                .name("주방")
                .x(300f)
                .y(300f)
                .roomType(RoomType.KITCHEN)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/map", elder.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.mapId").value("map-elder-" + elder.getId() + "-v1"))
                .andExpect(jsonPath("$.data.rooms.length()").value(2))
                .andExpect(jsonPath("$.data.rooms[0].id").value("LIVING_ROOM"))
                .andExpect(jsonPath("$.data.robotPosition.roomId").value("LIVING_ROOM"))
                .andDo(document("elder-map-get"));
    }

    @Test
    @WithMockUser(username = "another@test.com", roles = {"WORKER"})
    void getMap_returnsForbiddenWhenNotOwner() throws Exception {
        userRepository.save(User.builder()
                .name("다른 유저")
                .email("another@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/map", elder.getId()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"))
                .andDo(document("elder-map-forbidden"));
    }
}
