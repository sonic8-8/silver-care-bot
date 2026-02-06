package site.silverbot.api.user.controller;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.security.test.context.support.WithMockUser;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.notification.NotificationRepository;
import site.silverbot.domain.robot.RobotCommandRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.ThemeMode;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;
import site.silverbot.domain.user.UserRole;
import site.silverbot.support.RestDocsSupport;

class MySettingsControllerTest extends RestDocsSupport {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ElderRepository elderRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private EmergencyRepository emergencyRepository;

    @Autowired
    private RobotCommandRepository robotCommandRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @BeforeEach
    void setUp() {
        robotCommandRepository.deleteAllInBatch();
        emergencyRepository.deleteAllInBatch();
        robotRepository.deleteAllInBatch();
        emergencyContactRepository.deleteAllInBatch();
        notificationRepository.deleteAllInBatch();
        elderRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        userRepository.save(User.builder()
                .name("김복지")
                .email("worker@test.com")
                .password("password")
                .role(UserRole.WORKER)
                .theme(ThemeMode.SYSTEM)
                .build());
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void getMySettings_returnsThemeAndNotificationSettings() throws Exception {
        mockMvc.perform(RestDocumentationRequestBuilders.get("/api/users/me/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.theme").value("SYSTEM"))
                .andExpect(jsonPath("$.data.notificationSettings.emergencyEnabled").value(true))
                .andExpect(jsonPath("$.data.notificationSettings.realtimeEnabled").value(true))
                .andDo(document("my-settings-get"));
    }

    @Test
    @WithMockUser(username = "worker@test.com", roles = {"WORKER"})
    void updateMySettings_patchesThemeAndNotificationFlags() throws Exception {
        String request = """
                {
                  "theme": "LIGHT",
                  "notificationSettings": {
                    "emergencyEnabled": true,
                    "medicationEnabled": false,
                    "scheduleEnabled": true,
                    "activityEnabled": false,
                    "systemEnabled": true,
                    "realtimeEnabled": false
                  }
                }
                """;

        mockMvc.perform(RestDocumentationRequestBuilders.patch("/api/users/me/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.theme").value("LIGHT"))
                .andExpect(jsonPath("$.data.notificationSettings.medicationEnabled").value(false))
                .andExpect(jsonPath("$.data.notificationSettings.activityEnabled").value(false))
                .andExpect(jsonPath("$.data.notificationSettings.realtimeEnabled").value(false))
                .andDo(document("my-settings-patch"));
    }
}
