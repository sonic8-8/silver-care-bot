package site.silverbot.api.robot.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.robot.request.RobotCommandRequest;
import site.silverbot.api.robot.request.RobotSyncRequest;
import site.silverbot.api.robot.request.UpdateRobotLcdModeRequest;
import site.silverbot.api.robot.request.UpdateRobotLocationRequest;
import site.silverbot.api.robot.response.CommandResponse;
import site.silverbot.api.robot.response.RobotLcdResponse;
import site.silverbot.api.robot.response.RobotLocationUpdateResponse;
import site.silverbot.api.robot.response.RobotStatusResponse;
import site.silverbot.api.robot.response.RobotSyncResponse;
import site.silverbot.api.robot.response.UpdateRobotLcdModeResponse;
import site.silverbot.api.robot.service.RobotCommandService;
import site.silverbot.api.robot.service.RobotService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/robots")
public class RobotController {
    private final RobotService robotService;
    private final RobotCommandService robotCommandService;

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

    @PostMapping("/{robotId}/lcd-mode")
    public ApiResponse<UpdateRobotLcdModeResponse> updateLcdMode(
            @PathVariable Long robotId,
            @Valid @RequestBody UpdateRobotLcdModeRequest request
    ) {
        return ApiResponse.success(robotService.updateLcdMode(robotId, request));
    }
}
