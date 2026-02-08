package site.silverbot.domain.patrol;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.Locale;

public enum PatrolTarget {
    GAS_VALVE,
    DOOR,
    APPLIANCE,
    OUTLET,
    WINDOW,
    MULTI_TAP;

    @JsonCreator
    public static PatrolTarget from(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "GAS_VALVE" -> GAS_VALVE;
            case "DOOR" -> DOOR;
            case "APPLIANCE" -> APPLIANCE;
            case "OUTLET" -> OUTLET;
            case "WINDOW" -> WINDOW;
            case "MULTI_TAP" -> MULTI_TAP;
            default -> throw new IllegalArgumentException("Invalid patrol target: " + value);
        };
    }
}
