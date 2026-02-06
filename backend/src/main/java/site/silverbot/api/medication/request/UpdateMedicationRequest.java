package site.silverbot.api.medication.request;

import java.time.LocalDate;

import site.silverbot.api.medication.model.MedicationFrequency;

public record UpdateMedicationRequest(
        String name,
        String dosage,
        MedicationFrequency frequency,
        String timing,
        String color,
        LocalDate startDate,
        LocalDate endDate,
        Boolean isActive
) {
}
