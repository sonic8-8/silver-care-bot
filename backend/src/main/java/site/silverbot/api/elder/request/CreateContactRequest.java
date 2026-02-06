package site.silverbot.api.elder.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateContactRequest(
        @NotBlank
        @Size(max = 50)
        String name,
        @NotBlank
        @Size(max = 20)
        String phone,
        @Size(max = 30)
        String relation,
        @Min(1)
        @Max(5)
        Integer priority
) {
}
