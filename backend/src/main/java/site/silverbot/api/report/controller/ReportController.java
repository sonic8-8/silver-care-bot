package site.silverbot.api.report.controller;

import java.time.LocalDate;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.report.response.WeeklyReportResponse;
import site.silverbot.api.report.service.ReportService;

@RestController
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PreAuthorize("hasAnyRole('WORKER','FAMILY')")
    @GetMapping("/api/elders/{elderId}/reports/weekly")
    public ApiResponse<WeeklyReportResponse> getWeeklyReport(
            @PathVariable Long elderId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStartDate
    ) {
        return ApiResponse.success(reportService.getWeeklyReport(elderId, weekStartDate));
    }
}
