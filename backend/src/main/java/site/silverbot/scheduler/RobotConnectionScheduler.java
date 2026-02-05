package site.silverbot.scheduler;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.api.robot.service.RobotStatusNotifier;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;

@Component
@RequiredArgsConstructor
public class RobotConnectionScheduler {
    private static final Duration DISCONNECT_THRESHOLD = Duration.ofSeconds(120);
    private static final Duration OFFLINE_NOTIFY_THRESHOLD = Duration.ofMinutes(30);

    private final RobotRepository robotRepository;
    private final RobotStatusNotifier robotStatusNotifier;

    @Scheduled(fixedRateString = "30000")
    @Transactional
    public void checkRobotConnections() {
        LocalDateTime now = LocalDateTime.now();
        List<Robot> robots = robotRepository.findAll();

        for (Robot robot : robots) {
            LocalDateTime lastSyncAt = robot.getLastSyncAt();
            if (lastSyncAt == null) {
                boolean changed = robot.updateNetworkStatus(NetworkStatus.DISCONNECTED);
                if (changed) {
                    robotStatusNotifier.notifyStatusChanged(robot);
                }
                continue;
            }

            Duration offlineDuration = Duration.between(lastSyncAt, now);
            if (offlineDuration.compareTo(DISCONNECT_THRESHOLD) >= 0) {
                boolean changed = robot.updateNetworkStatus(NetworkStatus.DISCONNECTED);
                if (changed) {
                    robotStatusNotifier.notifyStatusChanged(robot);
                }
                if (robot.needsOfflineNotification(OFFLINE_NOTIFY_THRESHOLD, now)) {
                    robotStatusNotifier.notifyOffline(robot, offlineDuration);
                    robot.markOfflineNotified(now);
                }
            }
        }
    }
}
