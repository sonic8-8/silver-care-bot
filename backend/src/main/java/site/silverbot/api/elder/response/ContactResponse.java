package site.silverbot.api.elder.response;

public record ContactResponse(
        Long id,
        String name,
        String phone,
        String relation,
        Integer priority
) {
}
