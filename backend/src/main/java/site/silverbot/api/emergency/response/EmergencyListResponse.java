package site.silverbot.api.emergency.response;

import java.util.List;

public record EmergencyListResponse(
        List<EmergencyResponse> emergencies
) {
}
