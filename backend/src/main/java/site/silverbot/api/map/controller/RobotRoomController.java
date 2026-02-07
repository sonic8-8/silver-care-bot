package site.silverbot.api.map.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.map.request.CreateRoomRequest;
import site.silverbot.api.map.request.UpdateRoomRequest;
import site.silverbot.api.map.response.CreateRoomResponse;
import site.silverbot.api.map.response.RoomListResponse;
import site.silverbot.api.map.response.RoomResponse;
import site.silverbot.api.map.service.MapRoomService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/robots")
public class RobotRoomController {
    private final MapRoomService mapRoomService;

    @GetMapping("/{robotId}/rooms")
    public ApiResponse<RoomListResponse> getRooms(@PathVariable Long robotId) {
        return ApiResponse.success(mapRoomService.getRooms(robotId));
    }

    @PostMapping("/{robotId}/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CreateRoomResponse> createRoom(
            @PathVariable Long robotId,
            @Valid @RequestBody CreateRoomRequest request
    ) {
        return ApiResponse.success(mapRoomService.createRoom(robotId, request));
    }

    @PutMapping("/{robotId}/rooms/{roomId}")
    public ApiResponse<RoomResponse> updateRoom(
            @PathVariable Long robotId,
            @PathVariable String roomId,
            @Valid @RequestBody UpdateRoomRequest request
    ) {
        return ApiResponse.success(mapRoomService.updateRoom(robotId, roomId, request));
    }

    @DeleteMapping("/{robotId}/rooms/{roomId}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long robotId,
            @PathVariable String roomId
    ) {
        mapRoomService.deleteRoom(robotId, roomId);
        return ResponseEntity.noContent().build();
    }
}
