package site.silverbot.api.emergency.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.emergency.request.ReportEmergencyRequest;
import site.silverbot.api.emergency.request.ResolveEmergencyRequest;
import site.silverbot.api.emergency.response.EmergencyListResponse;
import site.silverbot.api.emergency.response.EmergencyResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.emergency.Emergency;
import site.silverbot.domain.emergency.EmergencyResolution;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class EmergencyService {
    private final EmergencyRepository emergencyRepository;
    private final RobotRepository robotRepository;
    private final ElderRepository elderRepository;
    private final UserRepository userRepository;

    public EmergencyResponse reportEmergency(Long robotId, ReportEmergencyRequest request) {
        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));
        Elder elder = robot.getElder();
        if (elder == null) {
            throw new EntityNotFoundException("Elder not found for robot");
        }
        User currentUser = getCurrentUser();
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

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public EmergencyListResponse getEmergencies() {
        User user = getCurrentUser();
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
        emergency.resolve(request.resolution(), request.note(), LocalDateTime.now());
        emergencyRepository.save(emergency);

        Elder elder = emergency.getElder();
        boolean hasPending = emergencyRepository.existsByElderIdAndResolution(elder.getId(), EmergencyResolution.PENDING);
        if (!hasPending) {
            elder.updateStatus(ElderStatus.SAFE);
            elderRepository.save(elder);
        }

        return toResponse(emergency);
    }

    private void validateOwnership(Elder elder) {
        User user = getCurrentUser();
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

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
