package site.silverbot.api.map.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.robot.response.RobotMapUploadResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.robot.Room;
import site.silverbot.domain.robot.RoomRepository;
import site.silverbot.domain.robot.RoomType;
import site.silverbot.domain.user.User;

@Service
@RequiredArgsConstructor
@Transactional
public class RobotMapUploadService {
    private static final TypeReference<List<RoomPayload>> ROOM_LIST_TYPE = new TypeReference<>() {
    };

    private final RobotRepository robotRepository;
    private final RoomRepository roomRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    public RobotMapUploadResponse upload(
            Long robotId,
            MultipartFile mapImage,
            MultipartFile mapConfig,
            String roomsJson
    ) {
        validateRequiredFile(mapImage, "mapImage");
        validateRequiredFile(mapConfig, "mapConfig");
        validateMapFileExtension(mapImage.getOriginalFilename(), List.of(".pgm"), "mapImage");
        validateMapFileExtension(mapConfig.getOriginalFilename(), List.of(".yaml", ".yml"), "mapConfig");

        Robot robot = getAccessibleRobot(robotId, true);
        List<RoomPayload> roomPayloads = parseRooms(roomsJson);
        List<RobotMapUploadResponse.UploadedRoom> uploadedRooms = upsertRooms(robot, roomPayloads);

        String mapId = "map-" + robotId + "-" + System.currentTimeMillis();
        return new RobotMapUploadResponse(
                mapId,
                OffsetDateTime.now(),
                uploadedRooms
        );
    }

    private List<RobotMapUploadResponse.UploadedRoom> upsertRooms(Robot robot, List<RoomPayload> roomPayloads) {
        List<RobotMapUploadResponse.UploadedRoom> uploadedRooms = new ArrayList<>();
        for (int i = 0; i < roomPayloads.size(); i++) {
            RoomPayload payload = roomPayloads.get(i);
            String roomId = resolveRoomId(robot.getId(), payload.id(), i + 1);
            String roomName = normalizeName(payload.name(), roomId);
            Float x = payload.x();
            Float y = payload.y();
            if (x == null || y == null) {
                throw new IllegalArgumentException("rooms[].x and rooms[].y are required");
            }

            Room room = roomRepository.findByRobotIdAndRoomIdIgnoreCase(robot.getId(), roomId)
                    .orElse(null);
            if (room == null) {
                room = Room.builder()
                        .robot(robot)
                        .roomId(roomId)
                        .name(roomName)
                        .x(x)
                        .y(y)
                        .roomType(inferRoomType(roomId, roomName))
                        .build();
                roomRepository.save(room);
            } else {
                room.updateName(roomName);
                room.updateCoordinate(x, y);
                RoomType inferred = inferRoomType(roomId, roomName);
                if (inferred != null) {
                    room.updateRoomType(inferred);
                }
            }

            uploadedRooms.add(new RobotMapUploadResponse.UploadedRoom(roomId, roomName));
        }
        return uploadedRooms;
    }

    private String normalizeName(String name, String fallbackRoomId) {
        if (StringUtils.hasText(name)) {
            return name.trim();
        }
        return fallbackRoomId;
    }

    private String resolveRoomId(Long robotId, String requestedRoomId, int sequence) {
        if (StringUtils.hasText(requestedRoomId)) {
            return requestedRoomId.trim()
                    .replaceAll("\\s+", "_")
                    .toUpperCase(Locale.ROOT);
        }

        int suffix = sequence;
        while (true) {
            String candidate = "ROOM_" + suffix;
            if (!roomRepository.existsByRobotIdAndRoomIdIgnoreCase(robotId, candidate)) {
                return candidate;
            }
            suffix++;
        }
    }

    private RoomType inferRoomType(String roomId, String roomName) {
        if (StringUtils.hasText(roomId)) {
            try {
                return RoomType.valueOf(roomId.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ignored) {
                // fallback
            }
        }
        if (!StringUtils.hasText(roomName)) {
            return null;
        }
        String normalizedName = roomName.trim();
        if (normalizedName.contains("거실")) {
            return RoomType.LIVING_ROOM;
        }
        if (normalizedName.contains("주방")) {
            return RoomType.KITCHEN;
        }
        if (normalizedName.contains("침실") || normalizedName.contains("안방") || normalizedName.endsWith("방")) {
            return RoomType.BEDROOM;
        }
        if (normalizedName.contains("화장실")) {
            return RoomType.BATHROOM;
        }
        if (normalizedName.contains("현관")) {
            return RoomType.ENTRANCE;
        }
        if (normalizedName.contains("도크") || normalizedName.contains("충전")) {
            return RoomType.DOCK;
        }
        return null;
    }

    private List<RoomPayload> parseRooms(String roomsJson) {
        if (!StringUtils.hasText(roomsJson)) {
            return List.of();
        }
        try {
            List<RoomPayload> rooms = objectMapper.readValue(roomsJson, ROOM_LIST_TYPE);
            return rooms == null ? List.of() : rooms;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid rooms json", ex);
        }
    }

    private void validateRequiredFile(MultipartFile file, String fieldName) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private void validateMapFileExtension(String fileName, List<String> allowedExtensions, String fieldName) {
        if (!StringUtils.hasText(fileName)) {
            throw new IllegalArgumentException(fieldName + " filename is required");
        }

        String lowerCase = fileName.toLowerCase(Locale.ROOT);
        boolean allowed = allowedExtensions.stream().anyMatch(lowerCase::endsWith);
        if (!allowed) {
            throw new IllegalArgumentException(fieldName + " has unsupported file extension");
        }
    }

    private Robot getAccessibleRobot(Long robotId, boolean allowRobotPrincipal) {
        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));

        Authentication authentication = getAuthentication();
        if (hasRole(authentication, "ROLE_ROBOT")) {
            if (!allowRobotPrincipal) {
                throw new AccessDeniedException("Robot principal is not allowed");
            }
            Long principalRobotId = parseLong(authentication.getName());
            if (principalRobotId == null || !robotId.equals(principalRobotId)) {
                throw new AccessDeniedException("Robot access denied");
            }
            return robot;
        }

        User user = currentUserService.getCurrentUser();
        Elder elder = robot.getElder();
        if (elder == null || elder.getUser() == null || !elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Robot access denied");
        }
        return robot;
    }

    private Authentication getAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }
        return authentication;
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority()));
    }

    private Long parseLong(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private record RoomPayload(
            String id,
            String name,
            Float x,
            Float y
    ) {
    }
}
