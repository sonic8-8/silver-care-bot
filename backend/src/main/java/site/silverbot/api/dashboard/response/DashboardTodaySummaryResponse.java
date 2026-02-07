package site.silverbot.api.dashboard.response;

import java.time.LocalDateTime;

public record DashboardTodaySummaryResponse(
        LocalDateTime wakeUpTime,
        DashboardMedicationStatusResponse medicationStatus,
        String activityStatus
) {
}
