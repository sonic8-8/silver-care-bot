package site.silverbot.api.medication.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import site.silverbot.api.medication.model.MedicationFrequency;

public record CreateMedicationRequest(
        @NotBlank
        String name,
        @NotBlank
        String dosage,
        @NotNull
        MedicationFrequency frequency,
        String timing,
        String color,
        LocalDate startDate,
        LocalDate endDate
) {
}
