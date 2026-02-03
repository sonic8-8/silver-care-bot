package site.silverbot.api.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        boolean success,
        ErrorInfo error,
        OffsetDateTime timestamp
) {
    public static ErrorResponse of(ErrorCode code, String message) {
        return of(code, message, null);
    }

    public static ErrorResponse of(ErrorCode code, String message, Object details) {
        return new ErrorResponse(false, new ErrorInfo(code.name(), message, details), OffsetDateTime.now());
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ErrorInfo(
            String code,
            String message,
            Object details
    ) {
    }
}
