package site.silverbot.api.map.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.map.response.ElderMapResponse;
import site.silverbot.api.map.service.MapRoomService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/elders")
public class ElderMapController {
    private final MapRoomService mapRoomService;

    @GetMapping("/{elderId}/map")
    public ApiResponse<ElderMapResponse> getMap(@PathVariable Long elderId) {
        return ApiResponse.success(mapRoomService.getElderMap(elderId));
    }
}
