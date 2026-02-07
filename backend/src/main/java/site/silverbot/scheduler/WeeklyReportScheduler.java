package site.silverbot.scheduler;

import java.time.DayOfWeek;
import java.time.LocalDate;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import site.silverbot.api.report.service.ReportService;

@Component
@RequiredArgsConstructor
public class WeeklyReportScheduler {
    private final ReportService reportService;

    @Scheduled(cron = "${app.report.weekly-cron:0 0 6 ? * MON}", zone = "Asia/Seoul")
    public void generatePreviousWeekReports() {
        LocalDate previousWeekStart = LocalDate.now()
                .minusWeeks(1)
                .with(DayOfWeek.MONDAY);
        reportService.generateWeeklyReportsForAllElders(previousWeekStart);
    }
}
