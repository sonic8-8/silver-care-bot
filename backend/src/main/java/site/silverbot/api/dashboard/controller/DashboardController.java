package site.silverbot.api.dashboard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.dashboard.response.DashboardResponse;
import site.silverbot.api.dashboard.service.DashboardService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/elders/{elderId}/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping
    public ApiResponse<DashboardResponse> getDashboard(@PathVariable Long elderId) {
        return ApiResponse.success(dashboardService.getDashboard(elderId));
    }
}
