package site.silverbot.api.activity.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.activity.repository.ActivityJdbcRepository;
import site.silverbot.api.activity.request.CreateActivityRequest;
import site.silverbot.api.activity.response.ActivityListResponse;
import site.silverbot.api.activity.response.ActivityResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivityService {
    private final ActivityJdbcRepository activityJdbcRepository;
    private final ElderRepository elderRepository;
    private final RobotRepository robotRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ActivityListResponse getActivities(Long elderId, LocalDate date) {
        LocalDate targetDate = date == null ? LocalDate.now() : date;
        getOwnedElder(elderId);

        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay().minusNanos(1);

        List<ActivityResponse> activities = activityJdbcRepository
                .findByElderAndRange(elderId, start, end)
                .stream()
                .map(this::toResponse)
                .toList();
        return new ActivityListResponse(targetDate, activities);
    }

    public ActivityResponse createRobotActivity(Long robotId, CreateActivityRequest request) {
        Robot robot = getRobot(robotId);
        validateRobotPrincipal(robotId);

        LocalDateTime detectedAt = request.detectedAt() == null ? LocalDateTime.now() : request.detectedAt();
        ActivityJdbcRepository.ActivityData saved = activityJdbcRepository.insert(
                robot.getElder().getId(),
                robotId,
                request.type(),
                request.title(),
                request.description(),
                request.location(),
                detectedAt
        );
        return toResponse(saved);
    }

    private ActivityResponse toResponse(ActivityJdbcRepository.ActivityData data) {
        return new ActivityResponse(
                data.id(),
                data.elderId(),
                data.robotId(),
                data.type(),
                data.title(),
                data.description(),
                data.location(),
                data.detectedAt(),
                data.createdAt()
        );
    }

    private Elder getOwnedElder(Long elderId) {
        Elder elder = elderRepository.findById(elderId)
                .orElseThrow(() -> new EntityNotFoundException("Elder not found"));
        User currentUser = getCurrentUser();
        if (!elder.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Activity access denied");
        }
        return elder;
    }

    private Robot getRobot(Long robotId) {
        return robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));
    }

    private void validateRobotPrincipal(Long robotId) {
        Authentication authentication = getAuthentication();
        boolean hasRobotRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ROBOT"::equals);
        if (!hasRobotRole) {
            throw new AccessDeniedException("Robot role required");
        }

        Long principalRobotId = parseLong(authentication.getName());
        if (principalRobotId == null || !principalRobotId.equals(robotId)) {
            throw new AccessDeniedException("Robot access denied");
        }
    }

    private User getCurrentUser() {
        Authentication authentication = getAuthentication();
        if (hasRole(authentication, "ROLE_ROBOT")) {
            throw new AccessDeniedException("Robot principal cannot access user ownership scope");
        }

        String principal = authentication.getName();
        Optional<User> byEmail = userRepository.findByEmail(principal);
        if (byEmail.isPresent()) {
            return byEmail.get();
        }

        Long userId = parseLong(principal);
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
        }

        throw new EntityNotFoundException("User not found");
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

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role::equals);
    }

    private Long parseLong(String value) {
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
