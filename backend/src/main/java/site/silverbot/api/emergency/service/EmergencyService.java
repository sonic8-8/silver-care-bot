package site.silverbot.api.emergency.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.emergency.request.ReportEmergencyRequest;
import site.silverbot.api.emergency.request.ResolveEmergencyRequest;
import site.silverbot.api.emergency.response.EmergencyListResponse;
import site.silverbot.api.emergency.response.EmergencyResponse;
import site.silverbot.api.notification.service.NotificationService;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.emergency.Emergency;
import site.silverbot.domain.emergency.EmergencyResolution;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.websocket.WebSocketMessageService;
import site.silverbot.websocket.dto.ElderStatusMessage;
import site.silverbot.websocket.dto.EmergencyMessage;

@Service
@RequiredArgsConstructor
@Transactional
public class EmergencyService {
    private final EmergencyRepository emergencyRepository;
    private final RobotRepository robotRepository;
    private final ElderRepository elderRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final WebSocketMessageService webSocketMessageService;

    public EmergencyResponse reportEmergency(Long robotId, ReportEmergencyRequest request) {
        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));
        Elder elder = robot.getElder();
        if (elder == null) {
            throw new EntityNotFoundException("Elder not found for robot");
        }
        User currentUser = currentUserService.getCurrentUser();
        if (!elder.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Not authorized to report emergency for this robot");
        }

        LocalDateTime detectedAt = resolveDetectedAt(request.detectedAt());
        String sensorData = request.sensorData() == null ? null : request.sensorData().toString();

        Emergency emergency = Emergency.builder()
                .elder(elder)
                .robot(robot)
                .type(request.type())
                .location(request.location())
                .confidence(request.confidence())
                .sensorData(sensorData)
                .detectedAt(detectedAt)
                .build();

        Emergency saved = emergencyRepository.save(emergency);
        elder.updateStatus(ElderStatus.DANGER);
        elder.updateLastActivity(detectedAt, request.location());
        notificationService.createEmergencyNotification(
                currentUser.getId(),
                elder.getId(),
                "긴급 상황이 감지되었습니다",
                elder.getName() + " 어르신에게 긴급 이벤트가 발생했습니다.",
                "/emergency/" + saved.getId()
        );
        publishElderStatus(elder);
        publishEmergency(saved);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public EmergencyListResponse getEmergencies() {
        User user = currentUserService.getCurrentUser();
        List<Long> elderIds = elderRepository.findAllByUserId(user.getId())
                .stream()
                .map(Elder::getId)
                .toList();
        if (elderIds.isEmpty()) {
            return new EmergencyListResponse(List.of());
        }
        List<EmergencyResponse> emergencies = emergencyRepository.findAllByElderIdInOrderByDetectedAtDesc(elderIds)
                .stream()
                .map(this::toResponse)
                .toList();
        return new EmergencyListResponse(emergencies);
    }

    @Transactional(readOnly = true)
    public EmergencyResponse getEmergency(Long emergencyId) {
        Emergency emergency = emergencyRepository.findById(emergencyId)
                .orElseThrow(() -> new EntityNotFoundException("Emergency not found"));
        validateOwnership(emergency.getElder());
        return toResponse(emergency);
    }

    public EmergencyResponse resolveEmergency(Long emergencyId, ResolveEmergencyRequest request) {
        Emergency emergency = emergencyRepository.findById(emergencyId)
                .orElseThrow(() -> new EntityNotFoundException("Emergency not found"));
        validateOwnership(emergency.getElder());
        if (emergency.getResolution() != EmergencyResolution.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 해제된 긴급 상황입니다.");
        }
        if (request.resolution() == EmergencyResolution.PENDING) {
            throw new IllegalArgumentException("PENDING은 해제 상태가 아닙니다.");
        }
        emergency.resolve(request.resolution(), request.note(), LocalDateTime.now());
        emergencyRepository.save(emergency);

        Elder elder = emergency.getElder();
        boolean hasPending = emergencyRepository.existsByElderIdAndResolution(elder.getId(), EmergencyResolution.PENDING);
        if (!hasPending) {
            elder.updateStatus(ElderStatus.SAFE);
            elderRepository.save(elder);
            publishElderStatus(elder);
        }

        return toResponse(emergency);
    }

    private void publishElderStatus(Elder elder) {
        webSocketMessageService.sendElderStatus(
                elder.getId(),
                new ElderStatusMessage.Payload(
                        elder.getId(),
                        elder.getStatus().name(),
                        toOffsetDateTime(elder.getLastActivityAt()),
                        elder.getLastLocation()
                )
        );
    }

    private void publishEmergency(Emergency emergency) {
        webSocketMessageService.broadcastEmergency(
                new EmergencyMessage.Payload(
                        emergency.getId(),
                        emergency.getElder().getId(),
                        emergency.getElder().getName(),
                        emergency.getType().name(),
                        emergency.getLocation(),
                        toOffsetDateTime(emergency.getDetectedAt())
                )
        );
    }

    private void validateOwnership(Elder elder) {
        User user = currentUserService.getCurrentUser();
        if (!elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Emergency access denied");
        }
    }

    private EmergencyResponse toResponse(Emergency emergency) {
        return new EmergencyResponse(
                emergency.getId(),
                emergency.getElder().getId(),
                emergency.getRobot() == null ? null : emergency.getRobot().getId(),
                emergency.getType(),
                emergency.getLocation(),
                emergency.getConfidence(),
                emergency.getResolution(),
                emergency.getResolutionNote(),
                emergency.getDetectedAt(),
                emergency.getResolvedAt()
        );
    }

    private LocalDateTime resolveDetectedAt(OffsetDateTime detectedAt) {
        if (detectedAt == null) {
            return LocalDateTime.now();
        }
        return detectedAt.toLocalDateTime();
    }

    private OffsetDateTime toOffsetDateTime(LocalDateTime value) {
        if (value == null) {
            return null;
        }
        return value.atOffset(OffsetDateTime.now().getOffset());
    }
}
