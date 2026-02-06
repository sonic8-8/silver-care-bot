package site.silverbot.websocket;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import site.silverbot.websocket.dto.ElderStatusMessage;
import site.silverbot.websocket.dto.EmergencyMessage;
import site.silverbot.websocket.dto.LcdModeMessage;
import site.silverbot.websocket.dto.NotificationMessage;
import site.silverbot.websocket.dto.RobotStatusMessage;
import site.silverbot.websocket.dto.WebSocketMessageType;

@ExtendWith(MockitoExtension.class)
class WebSocketMessageServiceTest {
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private WebSocketMessageService webSocketMessageService;

    @Test
    void sendRobotStatusPublishesMessage() {
        RobotStatusMessage.Payload payload = new RobotStatusMessage.Payload(
                1L,
                2L,
                88,
                "CONNECTED",
                "주방",
                "IDLE"
        );

        webSocketMessageService.sendRobotStatus(1L, payload);

        verify(messagingTemplate).convertAndSend(
                eq("/topic/robot/1/status"),
                argThat((RobotStatusMessage message) ->
                        message.type() == WebSocketMessageType.ROBOT_STATUS_UPDATE
                                && message.payload().equals(payload)
                                && message.timestamp() != null
                )
        );
    }

    @Test
    void sendLcdModePublishesMessage() {
        LcdModeMessage.Payload payload = new LcdModeMessage.Payload(
                1L,
                "MEDICATION",
                "happy",
                "약 드실 시간이에요!",
                "아침약"
        );

        webSocketMessageService.sendLcdMode(1L, payload);

        verify(messagingTemplate).convertAndSend(
                eq("/topic/robot/1/lcd"),
                argThat((LcdModeMessage message) ->
                        message.type() == WebSocketMessageType.LCD_MODE_CHANGE
                                && message.payload().equals(payload)
                                && message.timestamp() != null
                )
        );
    }

    @Test
    void sendElderStatusPublishesMessage() {
        ElderStatusMessage.Payload payload = new ElderStatusMessage.Payload(
                10L,
                "SAFE",
                OffsetDateTime.parse("2026-02-04T10:00:00+09:00"),
                "거실"
        );

        webSocketMessageService.sendElderStatus(10L, payload);

        verify(messagingTemplate).convertAndSend(
                eq("/topic/elder/10/status"),
                argThat((ElderStatusMessage message) ->
                        message.type() == WebSocketMessageType.ELDER_STATUS_UPDATE
                                && message.payload().equals(payload)
                                && message.timestamp() != null
                )
        );
    }

    @Test
    void sendNotificationPublishesMessage() {
        NotificationMessage.Payload payload = new NotificationMessage.Payload(
                200L,
                "MEDICATION",
                "복약 완료",
                "아침 약 복용이 완료되었습니다.",
                10L,
                "/elders/10/medications"
        );

        webSocketMessageService.sendNotification(7L, payload);

        verify(messagingTemplate).convertAndSend(
                eq("/topic/user/7/notifications"),
                argThat((NotificationMessage message) ->
                        message.type() == WebSocketMessageType.NOTIFICATION
                                && message.payload().equals(payload)
                                && message.timestamp() != null
                )
        );
    }

    @Test
    void broadcastEmergencyPublishesMessage() {
        EmergencyMessage.Payload payload = new EmergencyMessage.Payload(
                999L,
                10L,
                "김옥분",
                "FALL_DETECTED",
                "거실",
                OffsetDateTime.parse("2026-02-04T09:30:00+09:00")
        );

        webSocketMessageService.broadcastEmergency(payload);

        verify(messagingTemplate).convertAndSend(
                eq("/topic/emergency"),
                argThat((EmergencyMessage message) ->
                        message.type() == WebSocketMessageType.EMERGENCY_ALERT
                                && message.payload().equals(payload)
                                && message.timestamp() != null
                )
        );
    }
}
