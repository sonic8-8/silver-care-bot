package site.silverbot.api.robot.request;

import java.util.Map;

import jakarta.validation.constraints.NotNull;
import site.silverbot.domain.robot.CommandType;

public record RobotCommandRequest(
        @NotNull CommandType command,
        Map<String, Object> params
) {
}
