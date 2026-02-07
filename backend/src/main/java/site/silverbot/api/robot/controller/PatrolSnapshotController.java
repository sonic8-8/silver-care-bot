package site.silverbot.api.robot.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.robot.response.PatrolSnapshotListResponse;
import site.silverbot.api.robot.service.PatrolService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/patrol")
public class PatrolSnapshotController {
    private final PatrolService patrolService;

    @GetMapping("/{patrolId}/snapshots")
    public ApiResponse<PatrolSnapshotListResponse> getSnapshots(@PathVariable String patrolId) {
        return ApiResponse.success(patrolService.getPatrolSnapshots(patrolId));
    }
}
