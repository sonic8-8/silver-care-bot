package site.silverbot.api.robot.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.map.service.RobotMapUploadService;
import site.silverbot.api.robot.request.MedicationReminderRequest;
import site.silverbot.api.robot.request.MedicationResponseRequest;
import site.silverbot.api.robot.request.ReportPatrolResultsRequest;
import site.silverbot.api.robot.request.ReportSleepWakeRequest;
import site.silverbot.api.robot.request.RobotCommandAckRequest;
import site.silverbot.api.robot.request.RobotCommandRequest;
import site.silverbot.api.robot.request.ReportRobotEventsRequest;
import site.silverbot.api.robot.request.RobotSyncRequest;
import site.silverbot.api.robot.request.UpdateRobotLcdModeRequest;
import site.silverbot.api.robot.request.UpdateRobotLocationRequest;
import site.silverbot.api.robot.response.CommandResponse;
import site.silverbot.api.robot.response.PatrolReportResponse;
import site.silverbot.api.robot.response.RobotCommandAckResponse;
import site.silverbot.api.robot.response.RobotEventsReportResponse;
import site.silverbot.api.robot.response.RobotLcdResponse;
import site.silverbot.api.robot.response.RobotLocationUpdateResponse;
import site.silverbot.api.robot.response.RobotMapUploadResponse;
import site.silverbot.api.robot.response.RobotStatusResponse;
import site.silverbot.api.robot.response.RobotSyncResponse;
import site.silverbot.api.robot.response.UpdateRobotLcdModeResponse;
import site.silverbot.api.robot.service.PatrolService;
import site.silverbot.api.robot.service.RobotCommandService;
import site.silverbot.api.robot.service.RobotEventService;
import site.silverbot.api.robot.service.RobotService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/robots")
public class RobotController {
    private final RobotService robotService;
    private final RobotCommandService robotCommandService;
    private final RobotEventService robotEventService;
    private final PatrolService patrolService;
    private final RobotMapUploadService robotMapUploadService;

    @GetMapping("/{robotId}/status")
    public ApiResponse<RobotStatusResponse> getStatus(@PathVariable Long robotId) {
        return ApiResponse.success(robotService.getStatus(robotId));
    }

    @PostMapping("/{robotId}/commands")
    public ApiResponse<CommandResponse> sendCommand(
            @PathVariable Long robotId,
            @Valid @RequestBody RobotCommandRequest request
    ) {
        return ApiResponse.success(robotCommandService.createCommand(robotId, request));
    }

    @PostMapping("/{robotId}/commands/{commandId}/ack")
    public ApiResponse<RobotCommandAckResponse> acknowledgeCommand(
            @PathVariable Long robotId,
            @PathVariable String commandId,
            @Valid @RequestBody RobotCommandAckRequest request
    ) {
        return ApiResponse.success(robotCommandService.acknowledgeCommand(robotId, commandId, request));
    }

    @PostMapping("/{robotId}/sync")
    public ApiResponse<RobotSyncResponse> sync(
            @PathVariable Long robotId,
            @RequestBody(required = false) RobotSyncRequest request
    ) {
        return ApiResponse.success(robotService.sync(robotId, request));
    }

    @PutMapping("/{robotId}/location")
    public ApiResponse<RobotLocationUpdateResponse> updateLocation(
            @PathVariable Long robotId,
            @Valid @RequestBody UpdateRobotLocationRequest request
    ) {
        return ApiResponse.success(robotService.updateLocation(robotId, request));
    }

    @GetMapping("/{robotId}/lcd")
    public ApiResponse<RobotLcdResponse> getLcd(@PathVariable Long robotId) {
        return ApiResponse.success(robotService.getLcd(robotId));
    }

    @PostMapping("/{robotId}/events")
    public ApiResponse<RobotEventsReportResponse> reportEvents(
            @PathVariable Long robotId,
            @Valid @RequestBody ReportRobotEventsRequest request
    ) {
        return ApiResponse.success(robotEventService.reportEvents(robotId, request));
    }

    @PostMapping("/{robotId}/patrol-results")
    public ApiResponse<PatrolReportResponse> reportPatrolResults(
            @PathVariable Long robotId,
            @Valid @RequestBody ReportPatrolResultsRequest request
    ) {
        return ApiResponse.success(patrolService.reportPatrolResults(robotId, request));
    }

    @PostMapping("/{robotId}/sleep-wake")
    public ApiResponse<RobotEventsReportResponse> reportSleepWake(
            @PathVariable Long robotId,
            @Valid @RequestBody ReportSleepWakeRequest request
    ) {
        return ApiResponse.success(robotEventService.reportSleepWake(robotId, request));
    }

    @PostMapping("/{robotId}/medication-reminder")
    public ApiResponse<RobotEventsReportResponse> reportMedicationReminder(
            @PathVariable Long robotId,
            @Valid @RequestBody MedicationReminderRequest request
    ) {
        return ApiResponse.success(robotEventService.reportMedicationReminder(robotId, request));
    }

    @PostMapping("/{robotId}/medication-response")
    public ApiResponse<RobotEventsReportResponse> reportMedicationResponse(
            @PathVariable Long robotId,
            @Valid @RequestBody MedicationResponseRequest request
    ) {
        return ApiResponse.success(robotEventService.reportMedicationResponse(robotId, request));
    }

    @PostMapping(value = "/{robotId}/map", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<RobotMapUploadResponse> uploadRobotMap(
            @PathVariable Long robotId,
            @RequestPart("mapImage") MultipartFile mapImage,
            @RequestPart("mapConfig") MultipartFile mapConfig,
            @RequestParam(value = "rooms", required = false) String rooms
    ) {
        return ApiResponse.success(robotMapUploadService.upload(robotId, mapImage, mapConfig, rooms));
    }

    @PostMapping("/{robotId}/lcd-mode")
    public ApiResponse<UpdateRobotLcdModeResponse> updateLcdMode(
            @PathVariable Long robotId,
            @Valid @RequestBody UpdateRobotLcdModeRequest request
    ) {
        return ApiResponse.success(robotService.updateLcdMode(robotId, request));
    }
}
