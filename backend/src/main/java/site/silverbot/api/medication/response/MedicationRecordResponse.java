package site.silverbot.api.medication.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import site.silverbot.api.medication.model.MedicationMethod;
import site.silverbot.api.medication.model.MedicationStatus;
import site.silverbot.api.medication.model.MedicationTimeOfDay;

public record MedicationRecordResponse(
        Long id,
        Long medicationId,
        LocalDate recordDate,
        MedicationTimeOfDay timeOfDay,
        MedicationStatus status,
        LocalDateTime takenAt,
        MedicationMethod method
) {
}
