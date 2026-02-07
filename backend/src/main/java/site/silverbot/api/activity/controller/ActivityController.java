package site.silverbot.api.activity.controller;

import java.time.LocalDate;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import site.silverbot.api.activity.request.CreateActivityRequest;
import site.silverbot.api.activity.response.ActivityListResponse;
import site.silverbot.api.activity.response.ActivityResponse;
import site.silverbot.api.activity.service.ActivityService;
import site.silverbot.api.common.ApiResponse;

@RestController
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    @PreAuthorize("hasAnyRole('WORKER','FAMILY')")
    @GetMapping("/api/elders/{elderId}/activities")
    public ApiResponse<ActivityListResponse> getActivities(
            @PathVariable Long elderId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ApiResponse.success(activityService.getActivities(elderId, date));
    }

    @PreAuthorize("hasRole('ROBOT')")
    @PostMapping("/api/robots/{robotId}/activities")
    public ApiResponse<ActivityResponse> createRobotActivity(
            @PathVariable Long robotId,
            @Valid @RequestBody CreateActivityRequest request
    ) {
        return ApiResponse.success(activityService.createRobotActivity(robotId, request));
    }
}
