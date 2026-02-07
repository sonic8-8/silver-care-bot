package site.silverbot.api.dashboard.response;

public record DashboardMedicationStatusResponse(
        DashboardMedicationPeriodStatusResponse morning,
        DashboardMedicationPeriodStatusResponse evening,
        int taken,
        int total,
        String label
) {
}
