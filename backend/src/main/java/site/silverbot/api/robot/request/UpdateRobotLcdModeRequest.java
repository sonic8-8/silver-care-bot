package site.silverbot.api.robot.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateRobotLcdModeRequest(
        @NotBlank
        String mode,

        @NotBlank
        String emotion,

        @Size(max = 255)
        String message,

        @Size(max = 255)
        String subMessage
) {
}
