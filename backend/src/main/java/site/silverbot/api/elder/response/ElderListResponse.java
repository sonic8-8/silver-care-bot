package site.silverbot.api.elder.response;

import java.util.List;

public record ElderListResponse(
        List<ElderSummaryResponse> elders,
        ElderSummary summary
) {
    public record ElderSummary(
            int total,
            int safe,
            int warning,
            int danger
    ) {
    }
}
