package site.silverbot.api.schedule.controller;

import java.time.LocalDate;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.schedule.request.CreateScheduleRequest;
import site.silverbot.api.schedule.request.CreateVoiceScheduleRequest;
import site.silverbot.api.schedule.request.UpdateScheduleRequest;
import site.silverbot.api.schedule.response.ScheduleListResponse;
import site.silverbot.api.schedule.response.ScheduleResponse;
import site.silverbot.api.schedule.service.ScheduleService;
import site.silverbot.domain.schedule.ScheduleType;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/elders/{elderId}/schedules")
public class ScheduleController {
    private final ScheduleService scheduleService;

    @PostMapping
    public ApiResponse<ScheduleResponse> createSchedule(
            @PathVariable Long elderId,
            @Valid @RequestBody CreateScheduleRequest request
    ) {
        return ApiResponse.success(scheduleService.createSchedule(elderId, request));
    }

    @GetMapping
    public ApiResponse<ScheduleListResponse> getSchedules(
            @PathVariable Long elderId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) ScheduleType type
    ) {
        return ApiResponse.success(scheduleService.getSchedules(elderId, startDate, endDate, type));
    }

    @GetMapping("/{scheduleId}")
    public ApiResponse<ScheduleResponse> getSchedule(
            @PathVariable Long elderId,
            @PathVariable Long scheduleId
    ) {
        return ApiResponse.success(scheduleService.getSchedule(elderId, scheduleId));
    }

    @PutMapping("/{scheduleId}")
    public ApiResponse<ScheduleResponse> updateSchedule(
            @PathVariable Long elderId,
            @PathVariable Long scheduleId,
            @Valid @RequestBody UpdateScheduleRequest request
    ) {
        return ApiResponse.success(scheduleService.updateSchedule(elderId, scheduleId, request));
    }

    @DeleteMapping("/{scheduleId}")
    public ApiResponse<Void> deleteSchedule(
            @PathVariable Long elderId,
            @PathVariable Long scheduleId
    ) {
        scheduleService.deleteSchedule(elderId, scheduleId);
        return ApiResponse.ok();
    }

    @PostMapping("/voice")
    public ApiResponse<ScheduleResponse> createVoiceSchedule(
            @PathVariable Long elderId,
            @Valid @RequestBody CreateVoiceScheduleRequest request
    ) {
        return ApiResponse.success(scheduleService.createVoiceSchedule(elderId, request));
    }
}
