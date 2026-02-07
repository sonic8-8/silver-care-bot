package site.silverbot.api.medication.response;

public record DispenserStatusResponse(
        Integer remaining,
        Integer capacity,
        boolean needsRefill,
        Integer daysUntilEmpty
) {
}
