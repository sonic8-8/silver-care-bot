package site.silverbot.api.medication.model;

public enum MedicationFrequency {
    MORNING,
    EVENING,
    BOTH;

    public boolean includes(MedicationTimeOfDay timeOfDay) {
        if (timeOfDay == null) {
            return false;
        }
        return switch (this) {
            case MORNING -> timeOfDay == MedicationTimeOfDay.MORNING;
            case EVENING -> timeOfDay == MedicationTimeOfDay.EVENING;
            case BOTH -> true;
        };
    }
}
