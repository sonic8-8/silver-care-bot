package site.silverbot.api.auth.response;

public record AuthRobotResponse(
        Long id,
        String serialNumber,
        Long elderId,
        String elderName
) {
}
