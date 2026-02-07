package site.silverbot.api.robot.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.robot.request.ReportPatrolRequest;
import site.silverbot.api.robot.response.PatrolReportResponse;
import site.silverbot.api.robot.service.PatrolService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/robots/{robotId}/patrol")
public class RobotPatrolController {
    private final PatrolService patrolService;

    @PostMapping("/report")
    public ApiResponse<PatrolReportResponse> report(
            @PathVariable Long robotId,
            @Valid @RequestBody ReportPatrolRequest request
    ) {
        return ApiResponse.success(patrolService.reportPatrol(robotId, request));
    }
}
