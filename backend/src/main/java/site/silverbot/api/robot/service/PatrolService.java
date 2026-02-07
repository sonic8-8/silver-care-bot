package site.silverbot.api.robot.service;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.robot.request.ReportPatrolRequest;
import site.silverbot.api.robot.response.PatrolHistoryEntryResponse;
import site.silverbot.api.robot.response.PatrolHistoryResponse;
import site.silverbot.api.robot.response.PatrolItemResponse;
import site.silverbot.api.robot.response.PatrolLatestResponse;
import site.silverbot.api.robot.response.PatrolReportResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.patrol.PatrolItem;
import site.silverbot.domain.patrol.PatrolItemStatus;
import site.silverbot.domain.patrol.PatrolOverallStatus;
import site.silverbot.domain.patrol.PatrolResult;
import site.silverbot.domain.patrol.PatrolResultRepository;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;

@Service
@RequiredArgsConstructor
@Transactional
public class PatrolService {
    private static final int MAX_PAGE_SIZE = 100;

    private final PatrolResultRepository patrolResultRepository;
    private final RobotRepository robotRepository;
    private final ElderRepository elderRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public PatrolLatestResponse getLatestPatrol(Long elderId) {
        validateUserPrincipalForElderRead();
        getOwnedElder(elderId);

        PatrolResult patrolResult = patrolResultRepository.findTopByElderIdOrderByCompletedAtDescIdDesc(elderId)
                .orElse(null);
        if (patrolResult == null) {
            return new PatrolLatestResponse(null, null, null, null, List.of());
        }

        return new PatrolLatestResponse(
                patrolResult.getId(),
                patrolResult.getPatrolId(),
                patrolResult.getOverallStatus(),
                patrolResult.getCompletedAt(),
                patrolResult.getItems().stream().map(this::toItemResponse).toList()
        );
    }

    @Transactional(readOnly = true)
    public PatrolHistoryResponse getPatrolHistory(Long elderId, int page, int size) {
        validateUserPrincipalForElderRead();
        getOwnedElder(elderId);
        validatePage(page, size);

        Page<PatrolResult> patrolPage = patrolResultRepository.findByElderIdOrderByCompletedAtDescIdDesc(
                elderId,
                PageRequest.of(page, size)
        );

        List<PatrolHistoryEntryResponse> responses = patrolPage.getContent().stream()
                .map(this::toHistoryEntry)
                .toList();

        return new PatrolHistoryResponse(
                responses,
                patrolPage.getNumber(),
                patrolPage.getSize(),
                patrolPage.getTotalElements(),
                patrolPage.getTotalPages(),
                patrolPage.hasNext()
        );
    }

    public PatrolReportResponse reportPatrol(Long robotId, ReportPatrolRequest request) {
        Robot robot = getRobot(robotId);
        validatePatrolWriteAccess(robot);

        PatrolResult existing = patrolResultRepository.findByPatrolId(request.patrolId())
                .orElse(null);
        if (existing != null) {
            if (!existing.getRobot().getId().equals(robotId)) {
                throw new IllegalArgumentException("patrolId already exists for another robot");
            }
            return toReportResponse(existing);
        }

        Elder elder = requireRobotElder(robot);
        LocalDateTime completedAt = resolveCompletedAt(request);
        PatrolOverallStatus overallStatus = resolveOverallStatus(request.items());

        PatrolResult patrolResult = PatrolResult.builder()
                .robot(robot)
                .elder(elder)
                .patrolId(request.patrolId())
                .overallStatus(overallStatus)
                .startedAt(request.startedAt())
                .completedAt(completedAt)
                .build();

        for (ReportPatrolRequest.PatrolItemRequest item : request.items()) {
            PatrolItem patrolItem = PatrolItem.builder()
                    .patrolResult(patrolResult)
                    .target(item.target())
                    .label(StringUtils.hasText(item.label()) ? item.label() : defaultLabel(item.target().name()))
                    .status(item.status())
                    .confidence(item.confidence())
                    .imageUrl(item.imageUrl())
                    .checkedAt(item.checkedAt() == null ? completedAt : item.checkedAt())
                    .build();
            patrolResult.addItem(patrolItem);
        }

        PatrolResult saved = patrolResultRepository.save(patrolResult);
        return toReportResponse(saved);
    }

    private PatrolHistoryEntryResponse toHistoryEntry(PatrolResult patrolResult) {
        return new PatrolHistoryEntryResponse(
                patrolResult.getId(),
                patrolResult.getPatrolId(),
                patrolResult.getOverallStatus(),
                patrolResult.getStartedAt(),
                patrolResult.getCompletedAt(),
                patrolResult.getItems().stream().map(this::toItemResponse).toList()
        );
    }

    private PatrolItemResponse toItemResponse(PatrolItem item) {
        return new PatrolItemResponse(
                item.getId(),
                item.getTarget(),
                item.getLabel(),
                item.getStatus(),
                item.getConfidence(),
                item.getImageUrl(),
                item.getCheckedAt()
        );
    }

    private PatrolReportResponse toReportResponse(PatrolResult result) {
        return new PatrolReportResponse(
                result.getId(),
                result.getPatrolId(),
                result.getOverallStatus(),
                result.getCompletedAt(),
                result.getItems().size()
        );
    }

    private PatrolOverallStatus resolveOverallStatus(List<ReportPatrolRequest.PatrolItemRequest> items) {
        boolean warningExists = items.stream()
                .map(ReportPatrolRequest.PatrolItemRequest::status)
                .anyMatch(this::isWarningStatus);
        return warningExists ? PatrolOverallStatus.WARNING : PatrolOverallStatus.SAFE;
    }

    private boolean isWarningStatus(PatrolItemStatus status) {
        return status == PatrolItemStatus.OFF
                || status == PatrolItemStatus.UNLOCKED
                || status == PatrolItemStatus.NEEDS_CHECK;
    }

    private LocalDateTime resolveCompletedAt(ReportPatrolRequest request) {
        if (request.completedAt() != null) {
            return request.completedAt();
        }
        return request.items().stream()
                .map(ReportPatrolRequest.PatrolItemRequest::checkedAt)
                .filter(java.util.Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());
    }

    private String defaultLabel(String target) {
        return switch (target) {
            case "GAS_VALVE" -> "가스밸브";
            case "DOOR" -> "현관문";
            case "OUTLET" -> "콘센트";
            case "WINDOW" -> "창문";
            case "MULTI_TAP" -> "멀티탭";
            default -> target;
        };
    }

    private void validatePage(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("page must be greater than or equal to 0");
        }
        if (size <= 0 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("size must be between 1 and 100");
        }
    }

    private Robot getRobot(Long robotId) {
        return robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));
    }

    private Elder requireRobotElder(Robot robot) {
        Elder elder = robot.getElder();
        if (elder == null) {
            throw new EntityNotFoundException("Robot is not assigned to elder");
        }
        return elder;
    }

    private Elder getOwnedElder(Long elderId) {
        Elder elder = elderRepository.findById(elderId)
                .orElseThrow(() -> new EntityNotFoundException("Elder not found"));
        User user = currentUserService.getCurrentUser();
        if (elder.getUser() == null || !elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Patrol access denied");
        }
        return elder;
    }

    private void validateUserPrincipalForElderRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }
        if (hasRole(authentication, "ROLE_ROBOT")) {
            throw new AccessDeniedException("Robot principal cannot access elder patrol read APIs");
        }
    }

    private void validatePatrolWriteAccess(Robot robot) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }

        if (hasRole(authentication, "ROLE_ROBOT")) {
            Long robotPrincipalId = parseLong(authentication.getName());
            if (robotPrincipalId == null || !robot.getId().equals(robotPrincipalId)) {
                throw new AccessDeniedException("Patrol access denied");
            }
            return;
        }

        User user = currentUserService.getCurrentUser();
        Elder elder = requireRobotElder(robot);
        if (elder.getUser() == null || !elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Patrol access denied");
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
