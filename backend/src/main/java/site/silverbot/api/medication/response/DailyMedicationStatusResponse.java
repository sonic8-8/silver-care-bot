package site.silverbot.api.medication.response;

import site.silverbot.api.medication.model.MedicationStatus;

public record DailyMedicationStatusResponse(
        String day,
        MedicationStatus morning,
        MedicationStatus evening
) {
}
