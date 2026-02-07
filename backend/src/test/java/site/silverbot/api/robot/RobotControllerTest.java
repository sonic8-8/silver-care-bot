package site.silverbot.api.robot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.relaxedRequestFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.requestFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.subsectionWithPath;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.pathParameters;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.restdocs.payload.JsonFieldType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.medication.Medication;
import site.silverbot.domain.medication.MedicationFrequency;
import site.silverbot.domain.medication.MedicationRecordRepository;
import site.silverbot.domain.medication.MedicationRepository;
import site.silverbot.domain.robot.CommandType;
import site.silverbot.domain.robot.LcdEmotion;
import site.silverbot.domain.robot.LcdMode;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotCommand;
import site.silverbot.domain.robot.RobotCommandRepository;
import site.silverbot.domain.robot.RobotLcdEvent;
import site.silverbot.domain.robot.RobotLcdEventRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class RobotControllerTest extends RestDocsSupport {

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private RobotCommandRepository robotCommandRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private EmergencyRepository emergencyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private MedicationRecordRepository medicationRecordRepository;

    @Autowired
    private RobotLcdEventRepository robotLcdEventRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Robot robot;

    @BeforeEach
    void setUp() {
        robotLcdEventRepository.deleteAllInBatch();
        medicationRecordRepository.deleteAllInBatch();
        medicationRepository.deleteAllInBatch();
        robotCommandRepository.deleteAllInBatch();
        emergencyRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        emergencyContactRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        User owner = userRepository.save(User.builder()
                .name("김복지")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());

        userRepository.save(User.builder()
                .name("다른 보호자")
                .email("other@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());

        Elder elder = elderRepository.save(Elder.builder()
                .user(owner)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());

        robot = robotRepository.save(Robot.builder()
                .elder(elder)
                .serialNumber("ROBOT-2026-X82")
                .authCode("A1B2C3")
                .batteryLevel(85)
                .isCharging(false)
                .networkStatus(NetworkStatus.CONNECTED)
                .currentLocation("거실")
                .lcdMode(LcdMode.IDLE)
                .lcdEmotion(LcdEmotion.NEUTRAL)
                .lastSyncAt(LocalDateTime.now().minusMinutes(1))
                .build());
    }

    @Test
    @WithMockUser
    void getRobotStatus() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/robots/{robotId}/status", robot.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(robot.getId()))
                .andExpect(jsonPath("$.data.serialNumber").value("ROBOT-2026-X82"))
                .andDo(document("robot-status",
                        pathParameters(
                                parameterWithName("robotId").description("로봇 ID")
                        ),
                        responseFields(
                                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                                fieldWithPath("data").type(JsonFieldType.OBJECT).description("응답 데이터"),
                                fieldWithPath("data.id").type(JsonFieldType.NUMBER).description("로봇 ID"),
                                fieldWithPath("data.serialNumber").type(JsonFieldType.STRING).description("시리얼 번호"),
                                fieldWithPath("data.batteryLevel").type(JsonFieldType.NUMBER).description("배터리"),
                                fieldWithPath("data.isCharging").type(JsonFieldType.BOOLEAN).description("충전 여부"),
                                fieldWithPath("data.networkStatus").type(JsonFieldType.STRING).description("네트워크 상태"),
                                fieldWithPath("data.currentLocation").type(JsonFieldType.STRING).description("현재 위치").optional(),
                                fieldWithPath("data.lcdMode").type(JsonFieldType.STRING).description("LCD 모드").optional(),
                                fieldWithPath("data.lastSyncAt").type(JsonFieldType.STRING).description("마지막 동기화 시간").optional(),
                                fieldWithPath("data.dispenser").type(JsonFieldType.OBJECT).description("디스펜서 상태"),
                                fieldWithPath("data.dispenser.remaining").type(JsonFieldType.NUMBER).description("남은 수량"),
                                fieldWithPath("data.dispenser.capacity").type(JsonFieldType.NUMBER).description("최대 수량"),
                                fieldWithPath("data.dispenser.daysUntilEmpty").type(JsonFieldType.NUMBER).description("소진 예상 일수"),
                                fieldWithPath("data.settings").type(JsonFieldType.OBJECT).description("로봇 설정"),
                                fieldWithPath("data.settings.morningMedicationTime").type(JsonFieldType.STRING).description("아침 복약 시간"),
                                fieldWithPath("data.settings.eveningMedicationTime").type(JsonFieldType.STRING).description("저녁 복약 시간"),
                                fieldWithPath("data.settings.ttsVolume").type(JsonFieldType.NUMBER).description("TTS 볼륨"),
                                fieldWithPath("data.settings.patrolTimeRange").type(JsonFieldType.OBJECT).description("순찰 시간"),
                                fieldWithPath("data.settings.patrolTimeRange.start").type(JsonFieldType.STRING).description("순찰 시작"),
                                fieldWithPath("data.settings.patrolTimeRange.end").type(JsonFieldType.STRING).description("순찰 종료"),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("응답 시각")
                        )
                ));
    }

    @Test
    @WithMockUser
    void sendRobotCommand() throws Exception {
        Map<String, Object> request = Map.of(
                "command", CommandType.MOVE_TO,
                "params", Map.of("location", "LIVING_ROOM")
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/commands", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.command").value("MOVE_TO"))
                .andDo(document("robot-command",
                        pathParameters(
                                parameterWithName("robotId").description("로봇 ID")
                        ),
                        requestFields(
                                fieldWithPath("command").type(JsonFieldType.STRING).description("명령 타입"),
                                fieldWithPath("params").type(JsonFieldType.OBJECT).description("명령 파라미터").optional(),
                                fieldWithPath("params.location").type(JsonFieldType.STRING).description("이동 대상 위치").optional()
                        ),
                        responseFields(
                                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                                fieldWithPath("data").type(JsonFieldType.OBJECT).description("응답 데이터"),
                                fieldWithPath("data.commandId").type(JsonFieldType.STRING).description("명령 ID"),
                                fieldWithPath("data.robotId").type(JsonFieldType.NUMBER).description("로봇 ID"),
                                fieldWithPath("data.command").type(JsonFieldType.STRING).description("명령 타입"),
                                fieldWithPath("data.params").type(JsonFieldType.OBJECT).description("명령 파라미터").optional(),
                                fieldWithPath("data.params.location").type(JsonFieldType.STRING).description("이동 대상 위치").optional(),
                                fieldWithPath("data.status").type(JsonFieldType.STRING).description("명령 상태"),
                                fieldWithPath("data.issuedAt").type(JsonFieldType.STRING).description("발행 시각"),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("응답 시각")
                        )
                ));
    }

    @Test
    @WithMockUser
    void syncRobot() throws Exception {
        RobotCommand pending = RobotCommand.builder()
                .robot(robot)
                .commandId("cmd-123")
                .command(CommandType.START_PATROL)
                .issuedAt(LocalDateTime.now().minusSeconds(30))
                .build();
        robotCommandRepository.save(pending);

        Map<String, Object> request = Map.of(
                "batteryLevel", 78,
                "isCharging", false,
                "currentLocation", Map.of(
                        "roomId", "KITCHEN",
                        "x", 10.5,
                        "y", 20.0,
                        "heading", 90
                ),
                "lcdState", Map.of(
                        "mode", "IDLE",
                        "emotion", "neutral",
                        "message", "",
                        "subMessage", ""
                ),
                "dispenser", Map.of("remaining", 3)
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/sync", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.pendingCommands[0].commandId").value("cmd-123"))
                .andDo(document("robot-sync",
                        pathParameters(
                                parameterWithName("robotId").description("로봇 ID")
                        ),
                        requestFields(
                                fieldWithPath("batteryLevel").type(JsonFieldType.NUMBER).description("배터리").optional(),
                                fieldWithPath("isCharging").type(JsonFieldType.BOOLEAN).description("충전 여부").optional(),
                                fieldWithPath("currentLocation").type(JsonFieldType.OBJECT).description("현재 위치").optional(),
                                fieldWithPath("currentLocation.roomId").type(JsonFieldType.STRING).description("방 ID").optional(),
                                fieldWithPath("currentLocation.x").type(JsonFieldType.NUMBER).description("좌표 X").optional(),
                                fieldWithPath("currentLocation.y").type(JsonFieldType.NUMBER).description("좌표 Y").optional(),
                                fieldWithPath("currentLocation.heading").type(JsonFieldType.NUMBER).description("방향").optional(),
                                fieldWithPath("lcdState").type(JsonFieldType.OBJECT).description("LCD 상태").optional(),
                                fieldWithPath("lcdState.mode").type(JsonFieldType.STRING).description("LCD 모드").optional(),
                                fieldWithPath("lcdState.emotion").type(JsonFieldType.STRING).description("감정").optional(),
                                fieldWithPath("lcdState.message").type(JsonFieldType.STRING).description("메시지").optional(),
                                fieldWithPath("lcdState.subMessage").type(JsonFieldType.STRING).description("보조 메시지").optional(),
                                fieldWithPath("dispenser").type(JsonFieldType.OBJECT).description("디스펜서").optional(),
                                fieldWithPath("dispenser.remaining").type(JsonFieldType.NUMBER).description("남은 수량").optional()
                        ),
                        responseFields(
                                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                                fieldWithPath("data").type(JsonFieldType.OBJECT).description("응답 데이터"),
                                fieldWithPath("data.pendingCommands").type(JsonFieldType.ARRAY).description("대기 명령"),
                                fieldWithPath("data.pendingCommands[].commandId").type(JsonFieldType.STRING).description("명령 ID"),
                                fieldWithPath("data.pendingCommands[].command").type(JsonFieldType.STRING).description("명령 타입"),
                                fieldWithPath("data.pendingCommands[].params").type(JsonFieldType.OBJECT).description("명령 파라미터").optional(),
                                fieldWithPath("data.pendingCommands[].issuedAt").type(JsonFieldType.STRING).description("발행 시각"),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("응답 시각")
                        )
                ));
    }

    @Test
    @WithMockUser
    void getRobotLcd() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/robots/{robotId}/lcd", robot.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.mode").value("IDLE"))
                .andDo(document("robot-lcd",
                        pathParameters(
                                parameterWithName("robotId").description("로봇 ID")
                        ),
                        responseFields(
                                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                                fieldWithPath("data").type(JsonFieldType.OBJECT).description("응답 데이터"),
                                fieldWithPath("data.mode").type(JsonFieldType.STRING).description("LCD 모드"),
                                fieldWithPath("data.emotion").type(JsonFieldType.STRING).description("표정"),
                                fieldWithPath("data.message").type(JsonFieldType.STRING).description("메시지").optional(),
                                fieldWithPath("data.subMessage").type(JsonFieldType.STRING).description("보조 메시지").optional(),
                                fieldWithPath("data.nextSchedule").type(JsonFieldType.OBJECT).description("다음 일정").optional(),
                                fieldWithPath("data.nextSchedule.label").type(JsonFieldType.STRING).description("일정 제목").optional(),
                                fieldWithPath("data.nextSchedule.time").type(JsonFieldType.STRING).description("일정 시간").optional(),
                                fieldWithPath("data.lastUpdatedAt").type(JsonFieldType.STRING).description("업데이트 시각"),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("응답 시각")
                        )
                ));
    }

    @Test
    void reportRobotEvents_recordsTakeActionAndMedicationRecord() throws Exception {
        Medication medication = createMedication("아침약");

        Map<String, Object> request = Map.of(
                "events", List.of(Map.of(
                        "type", "MEDICATION",
                        "action", "TAKE",
                        "medicationId", medication.getId(),
                        "timestamp", "2026-02-08T08:15:00+09:00",
                        "location", "거실",
                        "payload", Map.of("source", "LCD")
                ))
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/events", robot.getId())
                        .with(user(String.valueOf(robot.getId())).roles("ROBOT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.received").value(true))
                .andExpect(jsonPath("$.data.processedCount").value(1))
                .andExpect(jsonPath("$.data.medicationTakenCount").value(1))
                .andDo(document("robot-events-report",
                        pathParameters(
                                parameterWithName("robotId").description("로봇 ID")
                        ),
                        relaxedRequestFields(
                                fieldWithPath("events").type(JsonFieldType.ARRAY).description("이벤트 목록"),
                                fieldWithPath("events[].type").type(JsonFieldType.STRING).description("이벤트 타입"),
                                fieldWithPath("events[].action").type(JsonFieldType.STRING).description("액션 타입").optional(),
                                fieldWithPath("events[].medicationId").type(JsonFieldType.NUMBER).description("복약 ID").optional(),
                                fieldWithPath("events[].timestamp").type(JsonFieldType.STRING).description("이벤트 발생 시각").optional(),
                                fieldWithPath("events[].detectedAt").type(JsonFieldType.STRING).description("호환용 감지 시각").optional(),
                                fieldWithPath("events[].location").type(JsonFieldType.STRING).description("이벤트 위치").optional(),
                                fieldWithPath("events[].confidence").type(JsonFieldType.NUMBER).description("신뢰도").optional(),
                                subsectionWithPath("events[].payload").type(JsonFieldType.OBJECT).description("추가 메타데이터").optional()
                        ),
                        responseFields(
                                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                                fieldWithPath("data").type(JsonFieldType.OBJECT).description("응답 데이터"),
                                fieldWithPath("data.received").type(JsonFieldType.BOOLEAN).description("수신 여부"),
                                fieldWithPath("data.processedCount").type(JsonFieldType.NUMBER).description("처리 이벤트 건수"),
                                fieldWithPath("data.medicationTakenCount").type(JsonFieldType.NUMBER).description("복약 완료 처리 건수"),
                                fieldWithPath("data.medicationDeferredCount").type(JsonFieldType.NUMBER).description("복약 연기 처리 건수"),
                                fieldWithPath("data.serverTime").type(JsonFieldType.STRING).description("서버 처리 시각"),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("응답 시각")
                        )
                ));

        assertThat(robotLcdEventRepository.count()).isEqualTo(1);
        RobotLcdEvent savedEvent = robotLcdEventRepository.findAll().get(0);
        assertThat(savedEvent.getEventType()).isEqualTo("MEDICATION");
        assertThat(savedEvent.getEventAction()).isEqualTo("TAKE");
        assertThat(savedEvent.getMedicationId()).isEqualTo(medication.getId());

        Integer recordCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM medication_record WHERE medication_id = ? AND status = 'TAKEN'",
                Integer.class,
                medication.getId()
        );
        assertThat(recordCount).isEqualTo(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void reportRobotEvents_ownerWorkerAccepted() throws Exception {
        Map<String, Object> request = Map.of(
                "events", List.of(Map.of(
                        "type", "WAKE_UP",
                        "timestamp", "2026-02-08T07:30:00+09:00",
                        "location", "침실"
                ))
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/events", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.processedCount").value(1));
    }

    @Test
    void reportRobotEvents_takeWithoutMedicationId_badRequest() throws Exception {
        Map<String, Object> request = Map.of(
                "events", List.of(Map.of(
                        "type", "MEDICATION",
                        "action", "TAKE",
                        "timestamp", "2026-02-08T08:15:00+09:00"
                ))
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/events", robot.getId())
                        .with(user(String.valueOf(robot.getId())).roles("ROBOT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_REQUEST"));

        Integer takenRecordCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM medication_record WHERE status = 'TAKEN'",
                Integer.class
        );
        assertThat(takenRecordCount).isZero();

        Integer medicationTakenActivityCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM activity WHERE robot_id = ? AND type = 'MEDICATION_TAKEN'",
                Integer.class,
                robot.getId()
        );
        assertThat(medicationTakenActivityCount).isZero();

        assertThat(robotLcdEventRepository.count()).isZero();
    }

    @Test
    void reportRobotEvents_laterAction_createsMedicationNotification() throws Exception {
        Medication medication = createMedication("저녁약");
        Map<String, Object> request = Map.of(
                "events", List.of(Map.of(
                        "type", "MEDICATION",
                        "action", "LATER",
                        "medicationId", medication.getId(),
                        "timestamp", "2026-02-08T19:15:00+09:00"
                ))
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/events", robot.getId())
                        .with(user(String.valueOf(robot.getId())).roles("ROBOT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.medicationTakenCount").value(0))
                .andExpect(jsonPath("$.data.medicationDeferredCount").value(1));

        NotificationProjection projection = jdbcTemplate.queryForObject(
                """
                SELECT type, title, message, target_path
                FROM notification
                ORDER BY id DESC
                LIMIT 1
                """,
                (rs, rowNum) -> new NotificationProjection(
                        rs.getString("type"),
                        rs.getString("title"),
                        rs.getString("message"),
                        rs.getString("target_path")
                )
        );

        assertThat(projection).isNotNull();
        assertThat(projection.type()).isEqualTo("MEDICATION");
        assertThat(projection.title()).isEqualTo("복약 알림 연기");
        assertThat(projection.message()).contains("저녁약");
        assertThat(projection.targetPath()).isEqualTo("/elders/" + robot.getElder().getId() + "/medications");
    }

    @Test
    void reportRobotEvents_mismatchedRobotPrincipal_forbidden() throws Exception {
        Map<String, Object> request = Map.of(
                "events", List.of(Map.of(
                        "type", "WAKE_UP",
                        "timestamp", "2026-02-08T07:30:00+09:00"
                ))
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/events", robot.getId())
                        .with(user(String.valueOf(robot.getId() + 1)).roles("ROBOT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void reportRobotEvents_nonOwnerWorker_forbidden() throws Exception {
        Map<String, Object> request = Map.of(
                "events", List.of(Map.of(
                        "type", "WAKE_UP",
                        "timestamp", "2026-02-08T07:30:00+09:00"
                ))
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/robots/{robotId}/events", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateRobotLocation() throws Exception {
        Map<String, Object> request = Map.of(
                "x", 42.1,
                "y", 128.4,
                "roomId", "LIVING_ROOM",
                "heading", 135,
                "timestamp", "2026-02-07T10:23:00+09:00"
        );

        mockMvc.perform(RestDocumentationRequestBuilders.put("/api/robots/{robotId}/location", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.received").value(true))
                .andDo(document("robot-location-update",
                        pathParameters(
                                parameterWithName("robotId").description("로봇 ID")
                        ),
                        requestFields(
                                fieldWithPath("x").type(JsonFieldType.NUMBER).description("좌표 X"),
                                fieldWithPath("y").type(JsonFieldType.NUMBER).description("좌표 Y"),
                                fieldWithPath("roomId").type(JsonFieldType.STRING).description("방 ID"),
                                fieldWithPath("heading").type(JsonFieldType.NUMBER).description("로봇 헤딩").optional(),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("로봇 기준 측정 시각").optional()
                        ),
                        responseFields(
                                fieldWithPath("success").type(JsonFieldType.BOOLEAN).description("성공 여부"),
                                fieldWithPath("data").type(JsonFieldType.OBJECT).description("응답 데이터"),
                                fieldWithPath("data.received").type(JsonFieldType.BOOLEAN).description("수신 여부"),
                                fieldWithPath("data.serverTime").type(JsonFieldType.STRING).description("서버 수신 시각"),
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("응답 시각")
                        )
                ));

        Robot updated = robotRepository.findById(robot.getId()).orElseThrow();
        assertThat(updated.getCurrentLocation()).isEqualTo("LIVING_ROOM");
        assertThat(updated.getCurrentX()).isEqualTo(42.1f);
        assertThat(updated.getCurrentY()).isEqualTo(128.4f);
        assertThat(updated.getCurrentHeading()).isEqualTo(135);
    }

    @Test
    void updateRobotLocation_roleRobotWithMismatchedPrincipal_forbidden() throws Exception {
        Map<String, Object> request = Map.of(
                "x", 10.0,
                "y", 20.0,
                "roomId", "KITCHEN"
        );

        mockMvc.perform(RestDocumentationRequestBuilders.put("/api/robots/{robotId}/location", robot.getId())
                        .with(user(String.valueOf(robot.getId() + 1)).roles("ROBOT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"WORKER"})
    void updateRobotLocation_nonOwnerWorker_forbidden() throws Exception {
        Map<String, Object> request = Map.of(
                "x", 10.0,
                "y", 20.0,
                "roomId", "KITCHEN"
        );

        mockMvc.perform(RestDocumentationRequestBuilders.put("/api/robots/{robotId}/location", robot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isForbidden());
    }

    private Medication createMedication(String name) {
        return medicationRepository.save(Medication.builder()
                .elder(robot.getElder())
                .name(name)
                .dosage("1정")
                .frequency(MedicationFrequency.BOTH)
                .timing("아침/저녁")
                .color("#00C471")
                .isActive(true)
                .build());
    }

    private record NotificationProjection(
            String type,
            String title,
            String message,
            String targetPath
    ) {
    }
}
