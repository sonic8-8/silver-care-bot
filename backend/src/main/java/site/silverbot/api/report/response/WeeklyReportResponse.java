package site.silverbot.api.report.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record WeeklyReportResponse(
        LocalDate weekStartDate,
        LocalDate weekEndDate,
        double medicationRate,
        long activityCount,
        List<String> conversationKeywords,
        List<String> recommendations,
        LocalDateTime generatedAt,
        String source
) {
}
