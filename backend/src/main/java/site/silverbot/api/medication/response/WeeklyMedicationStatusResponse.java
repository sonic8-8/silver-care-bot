package site.silverbot.api.medication.response;

public record WeeklyMedicationStatusResponse(
        int taken,
        int missed,
        int total,
        double rate
) {
}
