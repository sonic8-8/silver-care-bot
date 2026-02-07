package site.silverbot.api.robot.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import site.silverbot.api.activity.model.ActivityType;
import site.silverbot.api.activity.repository.ActivityJdbcRepository;
import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.medication.model.MedicationMethod;
import site.silverbot.api.medication.model.MedicationStatus;
import site.silverbot.api.medication.model.MedicationTimeOfDay;
import site.silverbot.api.medication.repository.MedicationJdbcRepository;
import site.silverbot.api.notification.service.NotificationService;
import site.silverbot.api.robot.request.ReportRobotEventsRequest;
import site.silverbot.api.robot.response.RobotEventsReportResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotLcdEvent;
import site.silverbot.domain.robot.RobotLcdEventRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RobotEventService {
    private static final String ACTION_TAKE = "TAKE";
    private static final String ACTION_LATER = "LATER";
    private static final String ACTION_CONFIRM = "CONFIRM";
    private static final String ACTION_EMERGENCY = "EMERGENCY";
    private static final String EVENT_TYPE_MEDICATION = "MEDICATION";
    private static final String EVENT_TYPE_BUTTON = "BUTTON";
    private static final String EVENT_TYPE_LCD_BUTTON = "LCD_BUTTON";
    private static final String EVENT_TYPE_SCHEDULE = "SCHEDULE";
    private static final Set<String> SUPPORTED_EVENT_TYPES = Set.of(
            "WAKE_UP",
            "SLEEP",
            "OUT_DETECTED",
            "RETURN_DETECTED",
            "PATROL_COMPLETE",
            "EMERGENCY",
            EVENT_TYPE_MEDICATION,
            EVENT_TYPE_BUTTON,
            EVENT_TYPE_LCD_BUTTON,
            EVENT_TYPE_SCHEDULE
    );
    private static final Set<String> ACTION_REQUIRED_EVENT_TYPES = Set.of(
            EVENT_TYPE_BUTTON,
            EVENT_TYPE_LCD_BUTTON
    );
    private static final Set<String> MEDICATION_ACTION_EVENT_TYPES = Set.of(
            EVENT_TYPE_MEDICATION,
            EVENT_TYPE_BUTTON,
            EVENT_TYPE_LCD_BUTTON
    );
    private static final Set<String> CONFIRM_ACTION_EVENT_TYPES = Set.of(
            EVENT_TYPE_BUTTON,
            EVENT_TYPE_LCD_BUTTON,
            EVENT_TYPE_SCHEDULE
    );
    private static final Set<String> EMERGENCY_ACTION_EVENT_TYPES = Set.of(
            EVENT_TYPE_BUTTON,
            EVENT_TYPE_LCD_BUTTON,
            "EMERGENCY"
    );

    private final RobotRepository robotRepository;
    private final RobotLcdEventRepository robotLcdEventRepository;
    private final MedicationJdbcRepository medicationJdbcRepository;
    private final ActivityJdbcRepository activityJdbcRepository;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    @Transactional
    public RobotEventsReportResponse reportEvents(Long robotId, ReportRobotEventsRequest request) {
        Robot robot = getAccessibleRobot(robotId, true);

        int processedCount = 0;
        int medicationTakenCount = 0;
        int medicationDeferredCount = 0;

        for (ReportRobotEventsRequest.RobotEventRequest event : request.events()) {
            String normalizedType = normalizeRequired(event.type(), "type");
            String normalizedAction = normalizeOptional(event.action());
            LocalDateTime occurredAt = resolveOccurredAt(event.timestamp(), event.detectedAt());
            validateEventData(normalizedType, normalizedAction, event.medicationId());

            robotLcdEventRepository.save(RobotLcdEvent.builder()
                    .robot(robot)
                    .elder(robot.getElder())
                    .eventType(normalizedType)
                    .eventAction(normalizedAction)
                    .medicationId(event.medicationId())
                    .location(event.location())
                    .confidence(event.confidence())
                    .payload(serializePayload(event.payload()))
                    .occurredAt(occurredAt)
                    .build());

            SideEffectResult sideEffectResult = applySideEffects(
                    robot,
                    normalizedType,
                    normalizedAction,
                    event.medicationId(),
                    occurredAt,
                    event.location()
            );
            processedCount++;
            medicationTakenCount += sideEffectResult.medicationTakenCount();
            medicationDeferredCount += sideEffectResult.medicationDeferredCount();
        }

        return new RobotEventsReportResponse(
                true,
                processedCount,
                medicationTakenCount,
                medicationDeferredCount,
                OffsetDateTime.now()
        );
    }

    private SideEffectResult applySideEffects(
            Robot robot,
            String eventType,
            String action,
            Long medicationId,
            LocalDateTime occurredAt,
            String location
    ) {
        if (ACTION_TAKE.equals(action)) {
            handleMedicationTaken(robot, medicationId, occurredAt);
            insertActivity(robot, ActivityType.MEDICATION_TAKEN, occurredAt, location);
            return SideEffectResult.taken();
        }

        if (ACTION_LATER.equals(action)) {
            handleMedicationDeferred(robot, medicationId);
            ActivityType activityType = resolveActivityType(eventType, action);
            if (activityType != null) {
                insertActivity(robot, activityType, occurredAt, location);
            }
            return SideEffectResult.later();
        }

        if (ACTION_CONFIRM.equals(action)) {
            return SideEffectResult.none();
        }

        ActivityType activityType = resolveActivityType(eventType, action);
        if (activityType != null) {
            insertActivity(robot, activityType, occurredAt, location);
        }
        return SideEffectResult.none();
    }

    private void handleMedicationTaken(Robot robot, Long medicationId, LocalDateTime occurredAt) {
        if (medicationId == null) {
            return;
        }

        Elder elder = requireRobotElder(robot);
        MedicationJdbcRepository.MedicationData medication = medicationJdbcRepository
                .findMedicationByIdAndElderId(elder.getId(), medicationId)
                .orElseThrow(() -> new EntityNotFoundException("Medication not found"));

        MedicationTimeOfDay timeOfDay = MedicationTimeOfDay.from(occurredAt);
        if (!medication.frequency().includes(timeOfDay)) {
            throw new IllegalArgumentException("Medication frequency does not match event time-of-day");
        }

        medicationJdbcRepository.upsertMedicationRecord(
                elder.getId(),
                medication.id(),
                occurredAt.toLocalDate(),
                timeOfDay,
                MedicationStatus.TAKEN,
                occurredAt,
                MedicationMethod.BUTTON
        );
    }

    private void handleMedicationDeferred(Robot robot, Long medicationId) {
        Elder elder = robot.getElder();
        if (elder == null || elder.getUser() == null) {
            return;
        }

        String elderName = StringUtils.hasText(elder.getName()) ? elder.getName() : "어르신";
        String message;
        if (medicationId != null) {
            var medication = medicationJdbcRepository.findMedicationByIdAndElderId(elder.getId(), medicationId);
            if (medication.isPresent()) {
                message = elderName + " 어르신이 [" + medication.get().name() + "] 복약을 나중에 하기로 했습니다.";
            } else {
                message = elderName + " 어르신이 복약을 나중에 하기로 했습니다.";
            }
        } else {
            message = elderName + " 어르신이 복약을 나중에 하기로 했습니다.";
        }

        notificationService.createMedicationNotification(
                elder.getUser().getId(),
                elder.getId(),
                "복약 알림 연기",
                message,
                "/elders/" + elder.getId() + "/medications"
        );
    }

    private Robot getAccessibleRobot(Long robotId, boolean allowRobotPrincipal) {
        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));

        Authentication authentication = getAuthentication();
        if (hasRole(authentication, "ROLE_ROBOT")) {
            if (!allowRobotPrincipal) {
                throw new AccessDeniedException("Robot principal is not allowed");
            }
            Long principalRobotId = parseLong(authentication.getName());
            if (principalRobotId == null || !robotId.equals(principalRobotId)) {
                throw new AccessDeniedException("Robot access denied");
            }
            return robot;
        }

        User user = currentUserService.getCurrentUser();
        Elder elder = requireRobotElder(robot);
        if (elder.getUser() == null || !elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Robot access denied");
        }
        return robot;
    }

    private Authentication getAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }
        return authentication;
    }

    private Elder requireRobotElder(Robot robot) {
        Elder elder = robot.getElder();
        if (elder == null) {
            throw new EntityNotFoundException("Robot is not assigned to elder");
        }
        return elder;
    }

    private void insertActivity(Robot robot, ActivityType activityType, LocalDateTime occurredAt, String location) {
        if (activityType == null || robot.getElder() == null) {
            return;
        }
        activityJdbcRepository.insert(
                robot.getElder().getId(),
                robot.getId(),
                activityType,
                activityTitle(activityType),
                null,
                location,
                occurredAt
        );
    }

    private ActivityType resolveActivityType(String eventType, String action) {
        if (ACTION_EMERGENCY.equals(action)) {
            return ActivityType.EMERGENCY;
        }
        try {
            return ActivityType.valueOf(eventType);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String activityTitle(ActivityType type) {
        return switch (type) {
            case WAKE_UP -> "기상 감지";
            case SLEEP -> "취침 감지";
            case MEDICATION_TAKEN -> "복약 완료";
            case MEDICATION_MISSED -> "복약 미실시";
            case PATROL_COMPLETE -> "순찰 완료";
            case OUT_DETECTED -> "외출 감지";
            case RETURN_DETECTED -> "귀가 감지";
            case CONVERSATION -> "대화 기록";
            case EMERGENCY -> "긴급 이벤트";
        };
    }

    private String normalizeRequired(String value, String fieldName) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private void validateEventData(String eventType, String action, Long medicationId) {
        validateEventType(eventType);
        validateActionRequirements(eventType, action, medicationId);
    }

    private void validateEventType(String eventType) {
        if (!SUPPORTED_EVENT_TYPES.contains(eventType)) {
            throw new IllegalArgumentException("Unsupported event type: " + eventType);
        }
    }

    private void validateActionRequirements(String eventType, String action, Long medicationId) {
        if (action == null) {
            if (ACTION_REQUIRED_EVENT_TYPES.contains(eventType)) {
                throw new IllegalArgumentException("action is required for type " + eventType);
            }
            return;
        }

        switch (action) {
            case ACTION_TAKE -> {
                if (!MEDICATION_ACTION_EVENT_TYPES.contains(eventType)) {
                    throw new IllegalArgumentException("action TAKE is not allowed for type " + eventType);
                }
                if (medicationId == null) {
                    throw new IllegalArgumentException("medicationId is required when action is TAKE");
                }
            }
            case ACTION_LATER -> {
                if (!MEDICATION_ACTION_EVENT_TYPES.contains(eventType)) {
                    throw new IllegalArgumentException("action LATER is not allowed for type " + eventType);
                }
            }
            case ACTION_CONFIRM -> {
                if (!CONFIRM_ACTION_EVENT_TYPES.contains(eventType)) {
                    throw new IllegalArgumentException("action CONFIRM is not allowed for type " + eventType);
                }
            }
            case ACTION_EMERGENCY -> {
                if (!EMERGENCY_ACTION_EVENT_TYPES.contains(eventType)) {
                    throw new IllegalArgumentException("action EMERGENCY is not allowed for type " + eventType);
                }
            }
            default -> throw new IllegalArgumentException("Unsupported action: " + action);
        }
    }

    private String normalizeOptional(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private LocalDateTime resolveOccurredAt(OffsetDateTime timestamp, OffsetDateTime detectedAt) {
        if (timestamp != null) {
            return timestamp.toLocalDateTime();
        }
        if (detectedAt != null) {
            return detectedAt.toLocalDateTime();
        }
        return LocalDateTime.now();
    }

    private String serializePayload(Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Invalid payload", ex);
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

    private record SideEffectResult(int medicationTakenCount, int medicationDeferredCount) {
        private static SideEffectResult none() {
            return new SideEffectResult(0, 0);
        }

        private static SideEffectResult taken() {
            return new SideEffectResult(1, 0);
        }

        private static SideEffectResult later() {
            return new SideEffectResult(0, 1);
        }
    }
}
