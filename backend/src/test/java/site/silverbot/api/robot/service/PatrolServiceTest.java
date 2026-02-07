package site.silverbot.api.robot.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.robot.request.ReportPatrolRequest;
import site.silverbot.api.robot.response.PatrolHistoryResponse;
import site.silverbot.api.robot.response.PatrolLatestResponse;
import site.silverbot.api.robot.response.PatrolReportResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.patrol.PatrolItemStatus;
import site.silverbot.domain.patrol.PatrolResultRepository;
import site.silverbot.domain.patrol.PatrolTarget;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PatrolServiceTest {

    @Autowired
    private PatrolService patrolService;

    @Autowired
    private PatrolResultRepository patrolResultRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private UserRepository userRepository;

    private Elder elder;
    private Robot robot;

    @BeforeEach
    void setUp() {
        patrolResultRepository.deleteAllInBatch();
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

        robot = robotRepository.save(Robot.builder()
                .elder(elder)
                .serialNumber("ROBOT-0001")
                .authCode("123456")
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void reportPatrol_createsResultAndComputesOverallStatus() {
        ReportPatrolRequest request = new ReportPatrolRequest(
                "patrol-20260207-0900",
                LocalDateTime.of(2026, 2, 7, 9, 0),
                LocalDateTime.of(2026, 2, 7, 9, 5),
                List.of(
                        new ReportPatrolRequest.PatrolItemRequest(
                                PatrolTarget.GAS_VALVE,
                                "가스밸브",
                                PatrolItemStatus.NORMAL,
                                0.97f,
                                null,
                                LocalDateTime.of(2026, 2, 7, 9, 1)
                        ),
                        new ReportPatrolRequest.PatrolItemRequest(
                                PatrolTarget.DOOR,
                                "현관문",
                                PatrolItemStatus.NEEDS_CHECK,
                                0.88f,
                                null,
                                LocalDateTime.of(2026, 2, 7, 9, 4)
                        )
                )
        );

        PatrolReportResponse response = patrolService.reportPatrol(robot.getId(), request);

        assertThat(response.patrolResultId()).isNotNull();
        assertThat(response.overallStatus().name()).isEqualTo("WARNING");
        assertThat(response.itemCount()).isEqualTo(2);
        assertThat(patrolResultRepository.count()).isEqualTo(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getLatestPatrol_returnsMostRecentPatrol() {
        patrolService.reportPatrol(robot.getId(), new ReportPatrolRequest(
                "patrol-1",
                LocalDateTime.of(2026, 2, 7, 9, 0),
                LocalDateTime.of(2026, 2, 7, 9, 5),
                List.of(new ReportPatrolRequest.PatrolItemRequest(
                        PatrolTarget.GAS_VALVE,
                        "가스밸브",
                        PatrolItemStatus.NORMAL,
                        0.95f,
                        null,
                        LocalDateTime.of(2026, 2, 7, 9, 5)
                ))
        ));

        patrolService.reportPatrol(robot.getId(), new ReportPatrolRequest(
                "patrol-2",
                LocalDateTime.of(2026, 2, 8, 9, 0),
                LocalDateTime.of(2026, 2, 8, 9, 5),
                List.of(new ReportPatrolRequest.PatrolItemRequest(
                        PatrolTarget.WINDOW,
                        "창문",
                        PatrolItemStatus.LOCKED,
                        0.92f,
                        null,
                        LocalDateTime.of(2026, 2, 8, 9, 5)
                ))
        ));

        PatrolLatestResponse response = patrolService.getLatestPatrol(elder.getId());

        assertThat(response.patrolId()).isEqualTo("patrol-2");
        assertThat(response.items()).hasSize(1);
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getPatrolHistory_invalidSize_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class,
                () -> patrolService.getPatrolHistory(elder.getId(), 0, 0));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getPatrolHistory_otherUsersElder_throwsAccessDenied() {
        User anotherUser = userRepository.save(User.builder()
                .name("다른 사용자")
                .email("other@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .build());
        Elder anotherElder = elderRepository.save(Elder.builder()
                .user(anotherUser)
                .name("다른 어르신")
                .birthDate(LocalDate.of(1942, 1, 1))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());

        assertThrows(AccessDeniedException.class,
                () -> patrolService.getPatrolHistory(anotherElder.getId(), 0, 10));
    }
}
