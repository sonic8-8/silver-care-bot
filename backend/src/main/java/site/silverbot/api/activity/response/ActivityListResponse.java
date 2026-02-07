package site.silverbot.api.activity.response;

import java.time.LocalDate;
import java.util.List;

public record ActivityListResponse(
        LocalDate date,
        List<ActivityResponse> activities
) {
}
