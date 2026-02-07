package site.silverbot.api.dashboard.response;

import java.util.List;

public record DashboardResponse(
        DashboardTodaySummaryResponse todaySummary,
        List<DashboardNotificationResponse> recentNotifications,
        List<DashboardScheduleResponse> weeklySchedules,
        DashboardRobotStatusResponse robotStatus
) {
}
