package site.silverbot.api.elder.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.elder.request.CreateElderRequest;
import site.silverbot.api.elder.request.UpdateElderRequest;
import site.silverbot.api.elder.response.ElderListResponse;
import site.silverbot.api.elder.response.ElderResponse;
import site.silverbot.api.elder.service.ElderService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/elders")
public class ElderController {
    private final ElderService elderService;

    @GetMapping
    public ApiResponse<ElderListResponse> getElders() {
        return ApiResponse.success(elderService.getElders());
    }

    @GetMapping("/{elderId}")
    public ApiResponse<ElderResponse> getElder(@PathVariable Long elderId) {
        return ApiResponse.success(elderService.getElder(elderId));
    }

    @PostMapping
    public ApiResponse<ElderResponse> createElder(@Valid @RequestBody CreateElderRequest request) {
        return ApiResponse.success(elderService.createElder(request));
    }

    @PutMapping("/{elderId}")
    public ApiResponse<ElderResponse> updateElder(
            @PathVariable Long elderId,
            @Valid @RequestBody UpdateElderRequest request
    ) {
        return ApiResponse.success(elderService.updateElder(elderId, request));
    }

    @DeleteMapping("/{elderId}")
    public ApiResponse<Void> deleteElder(@PathVariable Long elderId) {
        elderService.deleteElder(elderId);
        return ApiResponse.success();
    }
}
