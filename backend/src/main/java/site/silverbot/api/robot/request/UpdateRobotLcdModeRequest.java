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
    public String normalizedMode() {
        return normalizeEnumValue(mode);
    }

    public String normalizedEmotion() {
        return normalizeEnumValue(emotion);
    }

    public String normalizedMessage() {
        return normalizeLcdText(message);
    }

    public String normalizedSubMessage() {
        return normalizeLcdText(subMessage);
    }

    private static String normalizeEnumValue(String value) {
        return value == null ? null : value.trim();
    }

    private static String normalizeLcdText(String value) {
        return value == null ? "" : value;
    }
}
