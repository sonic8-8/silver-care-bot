package site.silverbot.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import site.silverbot.websocket.dto.ElderStatusMessage;
import site.silverbot.websocket.dto.EmergencyMessage;
import site.silverbot.websocket.dto.LcdModeMessage;
import site.silverbot.websocket.dto.NotificationMessage;
import site.silverbot.websocket.dto.RobotStatusMessage;

@Service
@RequiredArgsConstructor
public class WebSocketMessageService {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendRobotStatus(long robotId, RobotStatusMessage.Payload payload) {
        messagingTemplate.convertAndSend(
                "/topic/robot/" + robotId + "/status",
                RobotStatusMessage.of(payload)
        );
    }

    public void sendLcdMode(long robotId, LcdModeMessage.Payload payload) {
        messagingTemplate.convertAndSend(
                "/topic/robot/" + robotId + "/lcd",
                LcdModeMessage.of(payload)
        );
    }

    public void sendElderStatus(long elderId, ElderStatusMessage.Payload payload) {
        messagingTemplate.convertAndSend(
                "/topic/elder/" + elderId + "/status",
                ElderStatusMessage.of(payload)
        );
    }

    public void sendNotification(long userId, NotificationMessage.Payload payload) {
        messagingTemplate.convertAndSend(
                "/topic/user/" + userId + "/notifications",
                NotificationMessage.of(payload)
        );
    }

    public void broadcastEmergency(EmergencyMessage.Payload payload) {
        messagingTemplate.convertAndSend("/topic/emergency", EmergencyMessage.of(payload));
    }
}
