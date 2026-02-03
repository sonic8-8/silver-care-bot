package site.silverbot.api.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        T data,
        OffsetDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, OffsetDateTime.now());
    }

    public static ApiResponse<Void> success() {
        return new ApiResponse<>(true, null, OffsetDateTime.now());
    }
}
