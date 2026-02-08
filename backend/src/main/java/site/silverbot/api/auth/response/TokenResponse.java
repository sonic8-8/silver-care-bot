package site.silverbot.api.auth.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TokenResponse(
        String accessToken,
        String refreshToken,
        Long expiresIn,
        AuthUserResponse user,
        AuthRobotResponse robot
) {
    public static TokenResponse withUser(
            String accessToken,
            String refreshToken,
            Long expiresIn,
            AuthUserResponse user
    ) {
        return new TokenResponse(accessToken, refreshToken, expiresIn, user, null);
    }

    public static TokenResponse withRobot(String accessToken, AuthRobotResponse robot) {
        return new TokenResponse(accessToken, null, null, null, robot);
    }

    public static TokenResponse tokens(String accessToken, String refreshToken, Long expiresIn) {
        return new TokenResponse(accessToken, refreshToken, expiresIn, null, null);
    }

    public static TokenResponse accessOnly(String accessToken, Long expiresIn) {
        return tokens(accessToken, null, expiresIn);
    }
}
