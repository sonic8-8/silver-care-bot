package site.silverbot.api.elder.request;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import site.silverbot.domain.elder.Gender;

public record CreateElderRequest(
        @NotBlank
        @Size(max = 50)
        String name,
        LocalDate birthDate,
        Gender gender,
        @Size(max = 255)
        String address,
        List<@Valid CreateContactRequest> emergencyContacts
) {
}
