package site.silverbot.api.common;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage(),
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));

        return build(ErrorCode.INVALID_REQUEST, "Validation failed", fieldErrors);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBindException(BindException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage(),
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));

        return build(ErrorCode.INVALID_REQUEST, "Validation failed", fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        return build(ErrorCode.INVALID_REQUEST, "Constraint violation", ex.getMessage());
    }

    @ExceptionHandler({
            IllegalArgumentException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception ex) {
        return build(ErrorCode.INVALID_REQUEST, "Invalid request", ex.getMessage());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
        return build(ErrorCode.NOT_FOUND, "Resource not found", ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return build(ErrorCode.FORBIDDEN, "Access denied", ex.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
        return build(ErrorCode.UNAUTHORIZED, "Unauthorized", ex.getMessage());
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        ErrorCode code = mapStatusToErrorCode(ex.getStatusCode());
        String message = ex.getReason() == null ? "Request failed" : ex.getReason();
        return build(code, message, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        return build(ErrorCode.INTERNAL_ERROR, "Internal server error", null);
    }

    private ResponseEntity<ErrorResponse> build(ErrorCode code, String message, Object details) {
        return ResponseEntity.status(code.getStatus())
                .body(ErrorResponse.of(code, message, details));
    }

    private ErrorCode mapStatusToErrorCode(HttpStatusCode statusCode) {
        HttpStatus status = HttpStatus.resolve(statusCode.value());
        if (status == null) {
            return ErrorCode.INTERNAL_ERROR;
        }
        if (status.is4xxClientError()) {
            return switch (status) {
                case UNAUTHORIZED -> ErrorCode.UNAUTHORIZED;
                case FORBIDDEN -> ErrorCode.FORBIDDEN;
                case NOT_FOUND -> ErrorCode.NOT_FOUND;
                case CONFLICT -> ErrorCode.CONFLICT;
                case BAD_REQUEST -> ErrorCode.INVALID_REQUEST;
                default -> ErrorCode.INVALID_REQUEST;
            };
        }
        return ErrorCode.INTERNAL_ERROR;
    }
}
