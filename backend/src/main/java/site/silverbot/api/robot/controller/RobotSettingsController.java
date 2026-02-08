package site.silverbot.api.robot.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.robot.request.UpdateRobotSettingsRequest;
import site.silverbot.api.robot.response.UpdateRobotSettingsResponse;
import site.silverbot.api.robot.service.RobotSettingsService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/robots")
public class RobotSettingsController {
    private final RobotSettingsService robotSettingsService;

    @PatchMapping("/{robotId}/settings")
    public ApiResponse<UpdateRobotSettingsResponse> updateSettings(
            @PathVariable Long robotId,
            @RequestBody(required = false) UpdateRobotSettingsRequest request
    ) {
        return ApiResponse.success(robotSettingsService.updateSettings(robotId, request));
    }
}
