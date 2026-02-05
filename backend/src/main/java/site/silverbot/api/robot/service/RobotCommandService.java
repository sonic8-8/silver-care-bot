package site.silverbot.api.robot.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.api.robot.request.RobotCommandRequest;
import site.silverbot.api.robot.response.CommandResponse;
import site.silverbot.api.robot.response.RobotSyncResponse;
import site.silverbot.domain.robot.CommandStatus;
import site.silverbot.domain.robot.CommandType;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotCommand;
import site.silverbot.domain.robot.RobotCommandRepository;
import site.silverbot.domain.robot.RobotRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RobotCommandService {
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final RobotRepository robotRepository;
    private final RobotCommandRepository robotCommandRepository;
    private final ObjectMapper objectMapper;

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
                .findAllByRobotIdAndStatusOrderByIssuedAtAsc(robotId, CommandStatus.PENDING);
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
}
