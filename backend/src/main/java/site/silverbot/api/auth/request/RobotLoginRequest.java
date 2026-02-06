package site.silverbot.api.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RobotLoginRequest(
        @NotBlank @Size(max = 50) String serialNumber,
        @NotBlank @Size(max = 10) String authCode
) {
}
