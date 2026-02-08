package site.silverbot.api.robot.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
import site.silverbot.api.robot.request.UpdateRobotSettingsRequest;
import site.silverbot.api.robot.response.UpdateRobotSettingsResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RobotSettingsService {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final RobotRepository robotRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public UpdateRobotSettingsResponse updateSettings(Long robotId, UpdateRobotSettingsRequest request) {
        Robot robot = getRobot(robotId);
        validateSettingsAccess(robot);

        if (request == null) {
            return toResponse(robot);
        }

        LocalTime morningMedicationTime = parseTime(request.morningMedicationTime(), "morningMedicationTime");
        LocalTime eveningMedicationTime = parseTime(request.eveningMedicationTime(), "eveningMedicationTime");
        Integer ttsVolume = validateTtsVolume(request.ttsVolume());

        LocalTime patrolStartTime = null;
        LocalTime patrolEndTime = null;
        if (request.patrolTimeRange() != null) {
            patrolStartTime = parseTime(request.patrolTimeRange().start(), "patrolTimeRange.start");
            patrolEndTime = parseTime(request.patrolTimeRange().end(), "patrolTimeRange.end");
        }

        LocalTime nextPatrolStartTime = patrolStartTime == null ? robot.getPatrolStartTime() : patrolStartTime;
        LocalTime nextPatrolEndTime = patrolEndTime == null ? robot.getPatrolEndTime() : patrolEndTime;
        validatePatrolTimeRange(nextPatrolStartTime, nextPatrolEndTime);

        robot.updateSettings(
                morningMedicationTime,
                eveningMedicationTime,
                ttsVolume,
                patrolStartTime,
                patrolEndTime
        );

        return toResponse(robot);
    }

    private Robot getRobot(Long robotId) {
        return robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));
    }

    private UpdateRobotSettingsResponse toResponse(Robot robot) {
        return new UpdateRobotSettingsResponse(
                robot.getMorningMedicationTime().format(TIME_FORMATTER),
                robot.getEveningMedicationTime().format(TIME_FORMATTER),
                robot.getTtsVolume(),
                new UpdateRobotSettingsResponse.PatrolTimeRange(
                        robot.getPatrolStartTime().format(TIME_FORMATTER),
                        robot.getPatrolEndTime().format(TIME_FORMATTER)
                ),
                robot.getUpdatedAt()
        );
    }

    private LocalTime parseTime(String value, String fieldName) {
        if (value == null) {
            return null;
        }
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException(fieldName + " must be in HH:mm format");
        }

        try {
            return LocalTime.parse(value.trim(), TIME_FORMATTER);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException(fieldName + " must be in HH:mm format");
        }
    }

    private Integer validateTtsVolume(Integer ttsVolume) {
        if (ttsVolume == null) {
            return null;
        }
        if (ttsVolume < 0 || ttsVolume > 100) {
            throw new IllegalArgumentException("ttsVolume must be between 0 and 100");
        }
        return ttsVolume;
    }

    private void validatePatrolTimeRange(LocalTime start, LocalTime end) {
        if (start == null || end == null) {
            return;
        }
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("patrolTimeRange.start must be earlier than patrolTimeRange.end");
        }
    }

    private void validateSettingsAccess(Robot robot) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }

        if (hasRole(authentication, "ROLE_ROBOT")) {
            Long robotPrincipalId = parseLong(authentication.getName());
            if (robotPrincipalId == null || !robot.getId().equals(robotPrincipalId)) {
                throw new AccessDeniedException("Robot settings access denied");
            }
            return;
        }

        Elder elder = robot.getElder();
        User user = currentUserService.getCurrentUser();
        if (elder == null || elder.getUser() == null || !elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Robot settings access denied");
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
}
