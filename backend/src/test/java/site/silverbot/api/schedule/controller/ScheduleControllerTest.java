package site.silverbot.api.schedule.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;

import site.silverbot.api.schedule.request.CreateScheduleRequest;
import site.silverbot.api.schedule.request.CreateVoiceScheduleRequest;
import site.silverbot.api.schedule.request.UpdateScheduleRequest;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.schedule.Schedule;
import site.silverbot.domain.schedule.ScheduleRepository;
import site.silverbot.domain.schedule.ScheduleType;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class ScheduleControllerTest extends RestDocsSupport {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private EmergencyRepository emergencyRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private UserRepository userRepository;

    private Elder elder;

    @BeforeEach
    void setUp() {
        scheduleRepository.deleteAllInBatch();
        emergencyRepository.deleteAllInBatch();
        emergencyContactRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        User user = userRepository.save(User.builder()
                .name("김복지")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());
        elder = elderRepository.save(Elder.builder()
                .user(user)
                .name("김옥분")
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createSchedule_createsSchedule() throws Exception {
        CreateScheduleRequest request = new CreateScheduleRequest(
                "병원 진료",
                "정기 검진",
                LocalDateTime.of(2026, 2, 8, 9, 30),
                "서울 병원",
                ScheduleType.HOSPITAL,
                30
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/elders/{elderId}/schedules", elder.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("병원 진료"))
                .andDo(document("schedule-create"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getSchedules_returnsFilteredList() throws Exception {
        scheduleRepository.save(Schedule.builder()
                .elder(elder)
                .title("병원 일정")
                .scheduledAt(LocalDateTime.of(2026, 2, 8, 9, 0))
                .type(ScheduleType.HOSPITAL)
                .build());
        scheduleRepository.save(Schedule.builder()
                .elder(elder)
                .title("개인 일정")
                .scheduledAt(LocalDateTime.of(2026, 2, 9, 9, 0))
                .type(ScheduleType.PERSONAL)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/elders/{elderId}/schedules", elder.getId())
                        .param("startDate", "2026-02-08")
                        .param("endDate", "2026-02-08")
                        .param("type", "HOSPITAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.schedules.length()").value(1))
                .andDo(document("schedule-list"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getSchedule_returnsDetail() throws Exception {
        Schedule schedule = scheduleRepository.save(Schedule.builder()
                .elder(elder)
                .title("개인 일정")
                .scheduledAt(LocalDateTime.of(2026, 2, 9, 9, 0))
                .type(ScheduleType.PERSONAL)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.get(
                        "/api/elders/{elderId}/schedules/{scheduleId}",
                        elder.getId(),
                        schedule.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(schedule.getId()))
                .andDo(document("schedule-detail"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateSchedule_updatesSchedule() throws Exception {
        Schedule schedule = scheduleRepository.save(Schedule.builder()
                .elder(elder)
                .title("수정 전 일정")
                .scheduledAt(LocalDateTime.of(2026, 2, 9, 9, 0))
                .type(ScheduleType.PERSONAL)
                .build());

        UpdateScheduleRequest request = new UpdateScheduleRequest(
                "수정 후 일정",
                "설명 수정",
                LocalDateTime.of(2026, 2, 9, 10, 0),
                "복지관",
                ScheduleType.FAMILY,
                15
        );

        mockMvc.perform(RestDocumentationRequestBuilders.put(
                        "/api/elders/{elderId}/schedules/{scheduleId}",
                        elder.getId(),
                        schedule.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("수정 후 일정"))
                .andDo(document("schedule-update"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void deleteSchedule_deletesSchedule() throws Exception {
        Schedule schedule = scheduleRepository.save(Schedule.builder()
                .elder(elder)
                .title("삭제 일정")
                .scheduledAt(LocalDateTime.of(2026, 2, 9, 9, 0))
                .type(ScheduleType.OTHER)
                .build());

        mockMvc.perform(RestDocumentationRequestBuilders.delete(
                        "/api/elders/{elderId}/schedules/{scheduleId}",
                        elder.getId(),
                        schedule.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andDo(document("schedule-delete"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createVoiceSchedule_createsVoiceSchedule() throws Exception {
        CreateVoiceScheduleRequest request = new CreateVoiceScheduleRequest(
                "내일 오전 9시에 병원 가기",
                "내일 오전 9시 병원 방문 일정 등록",
                0.92f,
                "병원 방문",
                LocalDateTime.of(2026, 2, 8, 9, 0),
                "서울 병원",
                ScheduleType.HOSPITAL,
                45
        );

        mockMvc.perform(RestDocumentationRequestBuilders.post("/api/elders/{elderId}/schedules/voice", elder.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.source").value("VOICE"))
                .andDo(document("schedule-voice-create"));
    }
}
