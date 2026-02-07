package site.silverbot.api.notification.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.notification.Notification;
import site.silverbot.domain.notification.NotificationRepository;
import site.silverbot.domain.notification.NotificationType;
import site.silverbot.domain.robot.RobotCommandRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class NotificationControllerTest extends RestDocsSupport {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RobotCommandRepository robotCommandRepository;

    @Autowired
    private EmergencyRepository emergencyRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    private User user;
    private Elder elder;

    @BeforeEach
    void setUp() {
        robotCommandRepository.deleteAllInBatch();
        emergencyRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        emergencyContactRepository.deleteAllInBatch();
        notificationRepository.deleteAllInBatch();
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
                .birthDate(LocalDate.of(1946, 5, 15))
                .gender(Gender.FEMALE)
                .status(ElderStatus.SAFE)
                .build());

        notificationRepository.save(Notification.builder()
                .user(user)
                .elder(elder)
                .type(NotificationType.EMERGENCY)
                .title("긴급 상황 감지")
                .message("어르신의 넘어짐이 감지되었습니다.")
                .targetPath("/emergency/1")
                .isRead(false)
                .build());

        notificationRepository.save(Notification.builder()
                .user(user)
                .elder(elder)
                .type(NotificationType.ACTIVITY)
                .title("로봇 오프라인")
                .message("로봇이 오프라인 상태입니다.")
                .targetPath("/elders/1/robot")
                .isRead(true)
                .readAt(LocalDateTime.now().minusMinutes(3))
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getNotifications_filtersByReadStatus() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/notifications")
                        .param("page", "0")
                        .param("size", "10")
                        .param("isRead", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.notifications.length()").value(1))
                .andExpect(jsonPath("$.data.notifications[0].isRead").value(false))
                .andDo(document("notification-list"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getUnreadCount_returnsCount() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreadCount").value(1))
                .andDo(document("notification-unread-count"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void markAsRead_updatesNotification() throws Exception {
        Notification unread = notificationRepository.findAll().stream()
                .filter(notification -> !notification.getIsRead())
                .findFirst()
                .orElseThrow();

        mockMvc.perform(RestDocumentationRequestBuilders.patch("/api/notifications/{id}/read", unread.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isRead").value(true))
                .andDo(document("notification-mark-read"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void markAllAsRead_updatesUnreadNotifications() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.patch("/api/notifications/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.updatedCount").value(1))
                .andDo(document("notification-mark-read-all"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void markAllAsRead_updatesAllUnreadOver500() throws Exception {
        notificationRepository.deleteAllInBatch();
        IntStream.rangeClosed(1, 550)
                .forEach(index -> notificationRepository.save(Notification.builder()
                        .user(user)
                        .elder(elder)
                        .type(NotificationType.ACTIVITY)
                        .title("테스트 알림 " + index)
                        .message("읽음 처리 테스트")
                        .targetPath("/notifications")
                        .isRead(false)
                        .build()));

        mockMvc.perform(RestDocumentationRequestBuilders.patch("/api/notifications/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.updatedCount").value(550));

        long unread = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        org.assertj.core.api.Assertions.assertThat(unread).isZero();
    }
}
