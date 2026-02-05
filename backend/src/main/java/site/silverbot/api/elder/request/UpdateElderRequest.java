package site.silverbot.api.elder.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;
import site.silverbot.domain.elder.Gender;

public record UpdateElderRequest(
        @Size(max = 50)
        String name,
        LocalDate birthDate,
        Gender gender,
        @Size(max = 255)
        String address
) {
}
