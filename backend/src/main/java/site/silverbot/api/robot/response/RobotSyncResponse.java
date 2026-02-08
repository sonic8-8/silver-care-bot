package site.silverbot.api.robot.response;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

import site.silverbot.domain.robot.CommandType;

public record RobotSyncResponse(
        List<PendingCommandResponse> pendingCommands,
        List<ScheduleReminderResponse> scheduleReminders,
        List<MedicationResponse> medications,
        OffsetDateTime serverTime
) {
    public record PendingCommandResponse(
            String commandId,
            CommandType command,
            Object params,
            LocalDateTime issuedAt
    ) {
    }

    public record ScheduleReminderResponse(
            Long scheduleId,
            String title,
            LocalDateTime datetime,
            LocalDateTime remindAt
    ) {
    }

    public record MedicationResponse(
            Long medicationId,
            LocalDateTime scheduledAt,
            String name
    ) {
    }
}
