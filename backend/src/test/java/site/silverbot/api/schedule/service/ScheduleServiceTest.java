package site.silverbot.api.schedule.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.schedule.request.CreateScheduleRequest;
import site.silverbot.api.schedule.request.CreateVoiceScheduleRequest;
import site.silverbot.api.schedule.request.UpdateScheduleRequest;
import site.silverbot.api.schedule.response.ScheduleListResponse;
import site.silverbot.api.schedule.response.ScheduleResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.schedule.Schedule;
import site.silverbot.domain.schedule.ScheduleRepository;
import site.silverbot.domain.schedule.ScheduleSource;
import site.silverbot.domain.schedule.ScheduleType;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ScheduleServiceTest {

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private User user;
    private Elder elder;

    @BeforeEach
    void setUp() {
        scheduleRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        entityManager.flush();
        entityManager.clear();

        user = userRepository.save(User.builder()
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
    void createSchedule_createsSchedule() {
        CreateScheduleRequest request = new CreateScheduleRequest(
                "병원 진료",
                "정기 검진",
                LocalDateTime.of(2026, 2, 7, 10, 30),
                "서울 병원",
                ScheduleType.HOSPITAL,
                30
        );

        ScheduleResponse response = scheduleService.createSchedule(elder.getId(), request);

        assertThat(response.id()).isNotNull();
        assertThat(response.title()).isEqualTo("병원 진료");
        assertThat(response.source()).isEqualTo(ScheduleSource.MANUAL);
        assertThat(scheduleRepository.count()).isEqualTo(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getSchedules_filtersByDateAndType() {
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

        ScheduleListResponse response = scheduleService.getSchedules(
                elder.getId(),
                LocalDate.of(2026, 2, 8),
                LocalDate.of(2026, 2, 8),
                ScheduleType.HOSPITAL
        );

        assertThat(response.schedules()).hasSize(1);
        assertThat(response.schedules().get(0).title()).isEqualTo("병원 일정");
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void createVoiceSchedule_savesVoiceFields() {
        CreateVoiceScheduleRequest request = new CreateVoiceScheduleRequest(
                "내일 오전 9시에 병원 가기",
                "내일 오전 9시 병원 방문 일정 등록",
                0.93f,
                "병원 방문",
                LocalDateTime.of(2026, 2, 8, 9, 0),
                "서울 병원",
                ScheduleType.HOSPITAL,
                45
        );

        ScheduleResponse response = scheduleService.createVoiceSchedule(elder.getId(), request);

        assertThat(response.source()).isEqualTo(ScheduleSource.VOICE);
        assertThat(response.voiceOriginal()).contains("병원");
        assertThat(response.confidence()).isEqualTo(0.93f);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateSchedule_updatesFields() {
        Schedule schedule = scheduleRepository.save(Schedule.builder()
                .elder(elder)
                .title("기존 일정")
                .scheduledAt(LocalDateTime.of(2026, 2, 8, 9, 0))
                .type(ScheduleType.PERSONAL)
                .build());

        UpdateScheduleRequest request = new UpdateScheduleRequest(
                "수정 일정",
                "설명 수정",
                LocalDateTime.of(2026, 2, 8, 11, 0),
                "복지관",
                ScheduleType.FAMILY,
                20
        );

        ScheduleResponse response = scheduleService.updateSchedule(elder.getId(), schedule.getId(), request);

        assertThat(response.title()).isEqualTo("수정 일정");
        assertThat(response.type()).isEqualTo(ScheduleType.FAMILY);
        assertThat(response.remindBeforeMinutes()).isEqualTo(20);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void deleteSchedule_removesSchedule() {
        Schedule schedule = scheduleRepository.save(Schedule.builder()
                .elder(elder)
                .title("삭제 예정")
                .scheduledAt(LocalDateTime.of(2026, 2, 8, 9, 0))
                .type(ScheduleType.OTHER)
                .build());

        scheduleService.deleteSchedule(elder.getId(), schedule.getId());

        assertThat(scheduleRepository.existsById(schedule.getId())).isFalse();
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getSchedule_otherUserElder_throwsAccessDenied() {
        User anotherUser = userRepository.save(User.builder()
                .name("다른 사용자")
                .email("other@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());
        Elder anotherElder = elderRepository.save(Elder.builder()
                .user(anotherUser)
                .name("타인 어르신")
                .build());
        Schedule target = scheduleRepository.save(Schedule.builder()
                .elder(anotherElder)
                .title("타인 일정")
                .scheduledAt(LocalDateTime.of(2026, 2, 9, 10, 0))
                .type(ScheduleType.PERSONAL)
                .build());

        assertThrows(
                AccessDeniedException.class,
                () -> scheduleService.getSchedule(anotherElder.getId(), target.getId())
        );
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getSchedules_invalidDateRange_throwsIllegalArgument() {
        assertThrows(
                IllegalArgumentException.class,
                () -> scheduleService.getSchedules(
                        elder.getId(),
                        LocalDate.of(2026, 2, 10),
                        LocalDate.of(2026, 2, 8),
                        null
                )
        );
    }
}
