package site.silverbot.api.medication.response;

import java.util.List;

public record MedicationListResponse(
        WeeklyMedicationStatusResponse weeklyStatus,
        List<DailyMedicationStatusResponse> dailyStatus,
        List<MedicationResponse> medications,
        DispenserStatusResponse dispenser
) {
}
