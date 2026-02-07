package site.silverbot.api.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.user.request.UpdateMySettingsRequest;
import site.silverbot.api.user.response.MySettingsResponse;
import site.silverbot.api.user.service.MySettingsService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me/settings")
public class MySettingsController {
    private final MySettingsService mySettingsService;

    @GetMapping
    public ApiResponse<MySettingsResponse> getMySettings() {
        return ApiResponse.success(mySettingsService.getMySettings());
    }

    @PatchMapping
    public ApiResponse<MySettingsResponse> updateMySettings(
            @Valid @RequestBody(required = false) UpdateMySettingsRequest request
    ) {
        return ApiResponse.success(mySettingsService.updateMySettings(request));
    }
}
