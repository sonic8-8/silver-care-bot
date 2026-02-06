package site.silverbot.api.auth.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Long expiresIn
) {
    public static TokenResponse of(String accessToken, String refreshToken, Long expiresIn) {
        return new TokenResponse(accessToken, refreshToken, "Bearer", expiresIn);
    }

    public static TokenResponse accessOnly(String accessToken, Long expiresIn) {
        return new TokenResponse(accessToken, null, "Bearer", expiresIn);
    }
}
