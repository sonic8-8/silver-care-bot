package site.silverbot.api.medication.response;

import java.time.LocalDate;

import site.silverbot.api.medication.model.MedicationFrequency;

public record MedicationResponse(
        Long id,
        String name,
        String dosage,
        MedicationFrequency frequency,
        String timing,
        String color,
        LocalDate startDate,
        LocalDate endDate,
        boolean isActive
) {
}
