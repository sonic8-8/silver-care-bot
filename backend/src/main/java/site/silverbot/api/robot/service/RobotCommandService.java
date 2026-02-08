package site.silverbot.api.robot.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
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
import site.silverbot.api.robot.request.RobotCommandAckRequest;
import site.silverbot.api.robot.request.RobotCommandRequest;
import site.silverbot.api.robot.response.CommandResponse;
import site.silverbot.api.robot.response.RobotCommandAckResponse;
import site.silverbot.api.robot.response.RobotSyncResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.robot.CommandStatus;
import site.silverbot.domain.robot.CommandType;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotCommand;
import site.silverbot.domain.robot.RobotCommandRepository;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RobotCommandService {
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final RobotRepository robotRepository;
    private final RobotCommandRepository robotCommandRepository;
    private final ObjectMapper objectMapper;
    private final CurrentUserService currentUserService;

    @Transactional
    public CommandResponse createCommand(Long robotId, RobotCommandRequest request) {
        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));

        validateCommand(request.command(), request.params());

        String commandId = UUID.randomUUID().toString();
        String paramsJson = serializeParams(request.params());
        LocalDateTime issuedAt = LocalDateTime.now();

        RobotCommand command = RobotCommand.builder()
                .robot(robot)
                .commandId(commandId)
                .command(request.command())
                .params(paramsJson)
                .issuedAt(issuedAt)
                .build();

        robotCommandRepository.save(command);

        return new CommandResponse(
                command.getCommandId(),
                robot.getId(),
                command.getCommand(),
                request.params(),
                command.getStatus(),
                command.getIssuedAt()
        );
    }

    @Transactional
    public List<RobotSyncResponse.PendingCommandResponse> consumePendingCommands(Long robotId) {
        List<RobotCommand> pendingCommands = robotCommandRepository
                .findAllByRobotIdAndStatusOrderByIssuedAtAscIdAsc(robotId, CommandStatus.PENDING);
        if (pendingCommands.isEmpty()) {
            return List.of();
        }

        List<RobotSyncResponse.PendingCommandResponse> responses = new ArrayList<>();
        for (RobotCommand command : pendingCommands) {
            command.markReceived();
            responses.add(new RobotSyncResponse.PendingCommandResponse(
                    command.getCommandId(),
                    command.getCommand(),
                    deserializeParams(command.getParams()),
                    command.getIssuedAt()
            ));
        }

        return responses;
    }

    @Transactional
    public RobotCommandAckResponse acknowledgeCommand(Long robotId, String commandId, RobotCommandAckRequest request) {
        getAccessibleRobot(robotId, true);
        validateAckStatus(request.status());

        RobotCommand command = robotCommandRepository.findByRobotIdAndCommandId(robotId, commandId)
                .orElseThrow(() -> new EntityNotFoundException("Command not found"));

        validateStatusTransition(command.getStatus(), request.status());
        command.markStatus(request.status());
        command.updateResult(serializeAny(request.result()));
        command.updateCompletedAt(resolveCompletedAt(request.status(), request.completedAt()));

        return new RobotCommandAckResponse(
                true,
                command.getCommandId(),
                command.getStatus(),
                command.getCompletedAt(),
                OffsetDateTime.now()
        );
    }

    private void validateCommand(CommandType command, Map<String, Object> params) {
        if (command == null) {
            throw new IllegalArgumentException("command is required");
        }

        switch (command) {
            case MOVE_TO -> {
                Object location = requireParam(params, "location", command);
                if (!(location instanceof String)) {
                    throw new IllegalArgumentException("location must be a string");
                }
            }
            case SPEAK -> {
                Object message = requireParam(params, "message", command);
                if (!(message instanceof String) || ((String) message).isBlank()) {
                    throw new IllegalArgumentException("message is required for SPEAK");
                }
            }
            case CHANGE_LCD_MODE -> {
                Object mode = requireParam(params, "mode", command);
                if (!(mode instanceof String)) {
                    throw new IllegalArgumentException("mode must be a string");
                }
            }
            default -> {
                // no-op
            }
        }
    }

    private Object requireParam(Map<String, Object> params, String key, CommandType command) {
        if (params == null || !params.containsKey(key) || params.get(key) == null) {
            throw new IllegalArgumentException(command.name().toLowerCase(Locale.ROOT) + " requires params." + key);
        }
        return params.get(key);
    }

    private void validateAckStatus(CommandStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("status is required");
        }
        if (status == CommandStatus.PENDING) {
            throw new IllegalArgumentException("status PENDING is not allowed for ack");
        }
    }

    private void validateStatusTransition(CommandStatus current, CommandStatus next) {
        if (current == next) {
            return;
        }

        if (isTerminalStatus(current)) {
            throw new IllegalArgumentException("Command already finalized");
        }

        switch (next) {
            case RECEIVED -> {
                if (current != CommandStatus.PENDING) {
                    throw new IllegalArgumentException("Invalid transition: " + current + " -> " + next);
                }
            }
            case IN_PROGRESS -> {
                if (current != CommandStatus.PENDING && current != CommandStatus.RECEIVED) {
                    throw new IllegalArgumentException("Invalid transition: " + current + " -> " + next);
                }
            }
            case COMPLETED, FAILED, CANCELLED -> {
                if (current != CommandStatus.PENDING
                        && current != CommandStatus.RECEIVED
                        && current != CommandStatus.IN_PROGRESS) {
                    throw new IllegalArgumentException("Invalid transition: " + current + " -> " + next);
                }
            }
            default -> throw new IllegalArgumentException("Unsupported status: " + next);
        }
    }

    private boolean isTerminalStatus(CommandStatus status) {
        return status == CommandStatus.COMPLETED
                || status == CommandStatus.FAILED
                || status == CommandStatus.CANCELLED;
    }

    private LocalDateTime resolveCompletedAt(CommandStatus status, OffsetDateTime completedAt) {
        if (!isTerminalStatus(status)) {
            return null;
        }
        if (completedAt != null) {
            return completedAt.toLocalDateTime();
        }
        return LocalDateTime.now();
    }

    private String serializeParams(Map<String, Object> params) {
        if (params == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(params);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize params", ex);
        }
    }

    private String serializeAny(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize result", ex);
        }
    }

    private Object deserializeParams(String params) {
        if (params == null || params.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(params, MAP_TYPE);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to deserialize params", ex);
        }
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
        Elder elder = robot.getElder();
        if (elder == null || elder.getUser() == null || !elder.getUser().getId().equals(user.getId())) {
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
