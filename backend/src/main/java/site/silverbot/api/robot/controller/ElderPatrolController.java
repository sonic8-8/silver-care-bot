package site.silverbot.api.robot.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.robot.response.PatrolHistoryResponse;
import site.silverbot.api.robot.response.PatrolLatestResponse;
import site.silverbot.api.robot.service.PatrolService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/elders/{elderId}/patrol")
public class ElderPatrolController {
    private final PatrolService patrolService;

    @GetMapping("/latest")
    public ApiResponse<PatrolLatestResponse> getLatest(@PathVariable Long elderId) {
        return ApiResponse.success(patrolService.getLatestPatrol(elderId));
    }

    @GetMapping("/history")
    public ApiResponse<PatrolHistoryResponse> getHistory(
            @PathVariable Long elderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(patrolService.getPatrolHistory(elderId, page, size));
    }
}
