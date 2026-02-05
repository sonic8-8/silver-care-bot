package site.silverbot.api.emergency.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.emergency.request.ReportEmergencyRequest;
import site.silverbot.api.emergency.request.ResolveEmergencyRequest;
import site.silverbot.api.emergency.response.EmergencyListResponse;
import site.silverbot.api.emergency.response.EmergencyResponse;
import site.silverbot.api.emergency.service.EmergencyService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class EmergencyController {
    private final EmergencyService emergencyService;

    @PostMapping("/robots/{robotId}/emergency")
    public ApiResponse<EmergencyResponse> reportEmergency(
            @PathVariable Long robotId,
            @Valid @RequestBody ReportEmergencyRequest request
    ) {
        return ApiResponse.success(emergencyService.reportEmergency(robotId, request));
    }

    @GetMapping("/emergencies")
    public ApiResponse<EmergencyListResponse> getEmergencies() {
        return ApiResponse.success(emergencyService.getEmergencies());
    }

    @GetMapping("/emergencies/{emergencyId}")
    public ApiResponse<EmergencyResponse> getEmergency(@PathVariable Long emergencyId) {
        return ApiResponse.success(emergencyService.getEmergency(emergencyId));
    }

    @PatchMapping("/emergencies/{emergencyId}/resolve")
    public ApiResponse<EmergencyResponse> resolveEmergency(
            @PathVariable Long emergencyId,
            @Valid @RequestBody ResolveEmergencyRequest request
    ) {
        return ApiResponse.success(emergencyService.resolveEmergency(emergencyId, request));
    }
}
