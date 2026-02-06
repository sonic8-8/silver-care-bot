package site.silverbot.api.medication.request;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;
import site.silverbot.api.medication.model.MedicationMethod;
import site.silverbot.api.medication.model.MedicationStatus;
import site.silverbot.api.medication.model.MedicationTimeOfDay;

public record CreateMedicationRecordRequest(
        @NotNull
        Long medicationId,
        @NotNull
        MedicationStatus status,
        OffsetDateTime takenAt,
        @NotNull
        MedicationMethod method,
        MedicationTimeOfDay timeOfDay
) {
}
