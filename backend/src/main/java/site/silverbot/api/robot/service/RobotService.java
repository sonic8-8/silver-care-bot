package site.silverbot.api.robot.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.api.robot.request.RobotSyncRequest;
import site.silverbot.api.robot.request.UpdateRobotLocationRequest;
import site.silverbot.api.robot.response.RobotLcdResponse;
import site.silverbot.api.robot.response.RobotLocationUpdateResponse;
import site.silverbot.api.robot.response.RobotStatusResponse;
import site.silverbot.api.robot.response.RobotSyncResponse;
import site.silverbot.domain.robot.LcdEmotion;
import site.silverbot.domain.robot.LcdMode;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RobotService {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final RobotRepository robotRepository;
    private final RobotCommandService robotCommandService;
    private final RobotStatusNotifier robotStatusNotifier;

    public RobotStatusResponse getStatus(Long robotId) {
        Robot robot = getRobot(robotId);

        int remaining = robot.getDispenserRemaining();
        int capacity = robot.getDispenserCapacity();

        int daysUntilEmpty = (int) Math.ceil(Math.max(remaining, 0) / 2.0);

        RobotStatusResponse.Dispenser dispenser = new RobotStatusResponse.Dispenser(
                remaining,
                capacity,
                daysUntilEmpty
        );

        RobotStatusResponse.Settings settings = new RobotStatusResponse.Settings(
                robot.getMorningMedicationTime().format(TIME_FORMATTER),
                robot.getEveningMedicationTime().format(TIME_FORMATTER),
                robot.getTtsVolume(),
                new RobotStatusResponse.PatrolTimeRange(
                        robot.getPatrolStartTime().format(TIME_FORMATTER),
                        robot.getPatrolEndTime().format(TIME_FORMATTER)
                )
        );

        return new RobotStatusResponse(
                robot.getId(),
                robot.getSerialNumber(),
                robot.getBatteryLevel(),
                robot.getIsCharging(),
                robot.getNetworkStatus(),
                robot.getCurrentLocation(),
                robot.getLcdMode(),
                robot.getLastSyncAt(),
                dispenser,
                settings
        );
    }

    public RobotLcdResponse getLcd(Long robotId) {
        Robot robot = getRobot(robotId);
        return new RobotLcdResponse(
                robot.getLcdMode().name(),
                robot.getLcdEmotion().name().toLowerCase(Locale.ROOT),
                robot.getLcdMessage(),
                robot.getLcdSubMessage(),
                null,
                robot.getUpdatedAt()
        );
    }

    @Transactional
    public RobotSyncResponse sync(Long robotId, RobotSyncRequest request) {
        Robot robot = getRobot(robotId);

        applySync(robot, request);

        boolean statusChanged = robot.updateNetworkStatus(NetworkStatus.CONNECTED);
        robot.updateLastSyncAt(LocalDateTime.now());
        robot.clearOfflineNotification();
        if (statusChanged) {
            robotStatusNotifier.notifyStatusChanged(robot);
        }

        return new RobotSyncResponse(robotCommandService.consumePendingCommands(robotId));
    }

    @Transactional
    public boolean updateNetworkStatus(Long robotId, NetworkStatus status) {
        Robot robot = getRobot(robotId);
        boolean statusChanged = robot.updateNetworkStatus(status);
        if (statusChanged) {
            robotStatusNotifier.notifyStatusChanged(robot);
        }
        return statusChanged;
    }

    @Transactional
    public RobotLocationUpdateResponse updateLocation(Long robotId, UpdateRobotLocationRequest request) {
        Robot robot = getRobot(robotId);
        robot.updateLocation(request.roomId(), request.x(), request.y(), request.heading());
        return new RobotLocationUpdateResponse(true, OffsetDateTime.now());
    }

    private Robot getRobot(Long robotId) {
        return robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));
    }

    private void applySync(Robot robot, RobotSyncRequest request) {
        if (request == null) {
            return;
        }

        robot.updateBatteryLevel(request.batteryLevel());
        robot.updateCharging(request.isCharging());

        RobotSyncRequest.CurrentLocation location = request.currentLocation();
        if (location != null) {
            robot.updateLocation(location.roomId(), location.x(), location.y(), location.heading());
        }

        RobotSyncRequest.LcdState lcdState = request.lcdState();
        if (lcdState != null) {
            robot.updateLcdState(
                    parseMode(lcdState.mode()),
                    parseEmotion(lcdState.emotion()),
                    lcdState.message(),
                    lcdState.subMessage()
            );
        }

        RobotSyncRequest.Dispenser dispenser = request.dispenser();
        if (dispenser != null) {
            robot.updateDispenserRemaining(dispenser.remaining());
        }
    }

    private LcdMode parseMode(String mode) {
        if (mode == null) {
            return null;
        }
        try {
            return LcdMode.valueOf(mode.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid lcd mode");
        }
    }

    private LcdEmotion parseEmotion(String emotion) {
        if (emotion == null) {
            return null;
        }
        try {
            return LcdEmotion.valueOf(emotion.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid lcd emotion");
        }
    }
}
