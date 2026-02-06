package site.silverbot.api.robot.service;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import site.silverbot.api.notification.service.NotificationService;
import site.silverbot.domain.robot.Robot;
import site.silverbot.websocket.WebSocketMessageService;
import site.silverbot.websocket.dto.RobotStatusMessage;

@Service
@RequiredArgsConstructor
public class WebSocketRobotStatusNotifier implements RobotStatusNotifier {
    private final WebSocketMessageService webSocketMessageService;
    private final NotificationService notificationService;

    @Override
    public void notifyStatusChanged(Robot robot) {
        webSocketMessageService.sendRobotStatus(
                robot.getId(),
                new RobotStatusMessage.Payload(
                        robot.getId(),
                        robot.getElder() == null ? null : robot.getElder().getId(),
                        robot.getBatteryLevel(),
                        robot.getNetworkStatus() == null ? null : robot.getNetworkStatus().name(),
                        robot.getCurrentLocation(),
                        robot.getLcdMode() == null ? null : robot.getLcdMode().name()
                )
        );
    }

    @Override
    public void notifyOffline(Robot robot, Duration offlineDuration) {
        if (robot.getElder() == null || robot.getElder().getUser() == null) {
            return;
        }
        long minutes = Math.max(1, offlineDuration.toMinutes());
        notificationService.createActivityNotification(
                robot.getElder().getUser().getId(),
                robot.getElder().getId(),
                "로봇 연결이 끊겼습니다",
                "로봇이 약 " + minutes + "분 동안 오프라인 상태입니다.",
                "/elders/" + robot.getElder().getId() + "/robot"
        );
    }
}
