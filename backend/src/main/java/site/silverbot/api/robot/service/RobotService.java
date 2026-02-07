package site.silverbot.api.robot.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.robot.request.RobotSyncRequest;
import site.silverbot.api.robot.request.UpdateRobotLocationRequest;
import site.silverbot.api.robot.response.RobotLcdResponse;
import site.silverbot.api.robot.response.RobotLocationUpdateResponse;
import site.silverbot.api.robot.response.RobotStatusResponse;
import site.silverbot.api.robot.response.RobotSyncResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.robot.LcdEmotion;
import site.silverbot.domain.robot.LcdMode;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RobotService {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final RobotRepository robotRepository;
    private final RobotCommandService robotCommandService;
    private final RobotStatusNotifier robotStatusNotifier;
    private final CurrentUserService currentUserService;

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
        validateLocationWriteAccess(robot);
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

    private void validateLocationWriteAccess(Robot robot) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }

        if (hasRole(authentication, "ROLE_ROBOT")) {
            Long robotPrincipalId = parseLong(authentication.getName());
            if (robotPrincipalId == null || !robot.getId().equals(robotPrincipalId)) {
                throw new AccessDeniedException("Robot location update access denied");
            }
            return;
        }

        Elder elder = robot.getElder();
        User user = currentUserService.getCurrentUser();
        if (elder == null || elder.getUser() == null || !elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Robot location update access denied");
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority()));
    }

    private Long parseLong(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return null;
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
