package site.silverbot.api.dashboard.response;

public record DashboardMedicationPeriodStatusResponse(
        int taken,
        int total,
        String status
) {
}
