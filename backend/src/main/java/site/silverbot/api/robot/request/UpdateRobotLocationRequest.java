package site.silverbot.api.robot.request;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateRobotLocationRequest(
        @NotNull
        Float x,

        @NotNull
        Float y,

        @NotBlank
        @Size(max = 50)
        String roomId,

        Integer heading,

        OffsetDateTime timestamp
) {
}
