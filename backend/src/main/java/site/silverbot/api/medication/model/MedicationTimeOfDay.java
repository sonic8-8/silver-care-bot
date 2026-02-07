package site.silverbot.api.medication.model;

import java.time.LocalDateTime;

public enum MedicationTimeOfDay {
    MORNING,
    EVENING;

    public static MedicationTimeOfDay from(LocalDateTime dateTime) {
        if (dateTime == null) {
            return MORNING;
        }
        return dateTime.getHour() < 12 ? MORNING : EVENING;
    }
}
