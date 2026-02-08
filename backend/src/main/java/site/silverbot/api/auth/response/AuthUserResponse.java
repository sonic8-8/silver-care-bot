package site.silverbot.api.auth.response;

import site.silverbot.domain.user.UserRole;

public record AuthUserResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        String phone
) {
}
