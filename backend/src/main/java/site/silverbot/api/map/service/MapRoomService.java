package site.silverbot.api.map.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.map.request.CreateRoomRequest;
import site.silverbot.api.map.request.UpdateRoomRequest;
import site.silverbot.api.map.response.CreateRoomResponse;
import site.silverbot.api.map.response.ElderMapResponse;
import site.silverbot.api.map.response.RoomListResponse;
import site.silverbot.api.map.response.RoomResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.robot.Room;
import site.silverbot.domain.robot.RoomRepository;
import site.silverbot.domain.robot.RoomType;
import site.silverbot.domain.user.User;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MapRoomService {
    private static final float DEFAULT_ROOM_WIDTH = 220f;
    private static final float DEFAULT_ROOM_HEIGHT = 180f;

    private final CurrentUserService currentUserService;
    private final ElderRepository elderRepository;
    private final RobotRepository robotRepository;
    private final RoomRepository roomRepository;

    public ElderMapResponse getElderMap(Long elderId) {
        User user = currentUserService.getCurrentUser();
        Elder elder = getOwnedElder(elderId, user);
        Robot robot = robotRepository.findByElderId(elder.getId())
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));
        List<Room> rooms = roomRepository.findAllByRobotIdOrderByCreatedAtAsc(robot.getId());

        return new ElderMapResponse(
                "map-elder-" + elder.getId() + "-v1",
                resolveLastUpdatedAt(robot, rooms),
                rooms.stream().map(this::toMapRoom).toList(),
                toRobotPosition(robot, rooms),
                buildMapHtml(rooms)
        );
    }

    public RoomListResponse getRooms(Long robotId) {
        User user = currentUserService.getCurrentUser();
        Robot robot = getOwnedRobot(robotId, user);
        List<RoomResponse> rooms = roomRepository.findAllByRobotIdOrderByCreatedAtAsc(robot.getId())
                .stream()
                .map(this::toRoomResponse)
                .toList();
        return new RoomListResponse(rooms);
    }

    @Transactional
    public CreateRoomResponse createRoom(Long robotId, CreateRoomRequest request) {
        User user = currentUserService.getCurrentUser();
        Robot robot = getOwnedRobot(robotId, user);

        String roomId = resolveRoomId(robot.getId(), request.id());
        if (roomRepository.existsByRobotIdAndRoomIdIgnoreCase(robot.getId(), roomId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room id already exists");
        }

        Coordinates coordinates = resolveCoordinates(robot, request.x(), request.y(), request.useCurrentLocation());
        Room room = Room.builder()
                .robot(robot)
                .roomId(roomId)
                .name(request.name().trim())
                .x(coordinates.x())
                .y(coordinates.y())
                .roomType(resolveRoomType(request.type(), roomId, request.name()))
                .build();

        Room saved = roomRepository.save(room);
        return new CreateRoomResponse(
                saved.getRoomId(),
                saved.getName(),
                saved.getX(),
                saved.getY(),
                saved.getCreatedAt()
        );
    }

    @Transactional
    public RoomResponse updateRoom(Long robotId, String roomId, UpdateRoomRequest request) {
        User user = currentUserService.getCurrentUser();
        Robot robot = getOwnedRobot(robotId, user);
        Room room = roomRepository.findByRobotIdAndRoomIdIgnoreCase(robot.getId(), normalizePathRoomId(roomId))
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        boolean hasName = StringUtils.hasText(request.name());
        if (!hasName && request.x() == null && request.y() == null && request.type() == null) {
            throw new IllegalArgumentException("At least one field must be provided");
        }

        if (hasName) {
            room.updateName(request.name().trim());
        }
        room.updateCoordinate(request.x(), request.y());
        room.updateRoomType(request.type());

        return toRoomResponse(room);
    }

    @Transactional
    public void deleteRoom(Long robotId, String roomId) {
        User user = currentUserService.getCurrentUser();
        Robot robot = getOwnedRobot(robotId, user);
        Room room = roomRepository.findByRobotIdAndRoomIdIgnoreCase(robot.getId(), normalizePathRoomId(roomId))
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));
        roomRepository.delete(room);
    }

    private Elder getOwnedElder(Long elderId, User user) {
        Elder elder = elderRepository.findById(elderId)
                .orElseThrow(() -> new EntityNotFoundException("Elder not found"));
        if (!elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Map access denied");
        }
        return elder;
    }

    private Robot getOwnedRobot(Long robotId, User user) {
        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new EntityNotFoundException("Robot not found"));
        if (robot.getElder() == null) {
            throw new EntityNotFoundException("Robot is not assigned to elder");
        }
        if (!robot.getElder().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Room access denied");
        }
        return robot;
    }

    private String resolveRoomId(Long robotId, String requestedRoomId) {
        if (StringUtils.hasText(requestedRoomId)) {
            String normalized = normalizeRoomId(requestedRoomId);
            if (normalized.length() > 50) {
                throw new IllegalArgumentException("room id must be less than or equal to 50 characters");
            }
            return normalized;
        }

        int suffix = 1;
        while (true) {
            String candidate = "ROOM_" + suffix;
            if (!roomRepository.existsByRobotIdAndRoomIdIgnoreCase(robotId, candidate)) {
                return candidate;
            }
            suffix++;
        }
    }

    private String normalizeRoomId(String roomId) {
        if (!StringUtils.hasText(roomId)) {
            throw new IllegalArgumentException("room id is required");
        }
        return roomId.trim()
                .replaceAll("\\s+", "_")
                .toUpperCase(Locale.ROOT);
    }

    private String normalizePathRoomId(String roomId) {
        if (!StringUtils.hasText(roomId)) {
            throw new IllegalArgumentException("room id is required");
        }
        return roomId.trim();
    }

    private Coordinates resolveCoordinates(Robot robot, Float x, Float y, Boolean useCurrentLocation) {
        if (Boolean.TRUE.equals(useCurrentLocation)) {
            if (robot.getCurrentX() == null || robot.getCurrentY() == null) {
                throw new IllegalArgumentException("Robot current location is unavailable");
            }
            return new Coordinates(robot.getCurrentX(), robot.getCurrentY());
        }
        if (x == null || y == null) {
            throw new IllegalArgumentException("x and y are required when useCurrentLocation is false");
        }
        return new Coordinates(x, y);
    }

    private RoomType resolveRoomType(RoomType requestedType, String roomId, String roomName) {
        if (requestedType != null) {
            return requestedType;
        }
        return inferRoomType(roomId, roomName);
    }

    private ElderMapResponse.MapRoom toMapRoom(Room room) {
        RoomType type = resolveRoomType(room.getRoomType(), room.getRoomId(), room.getName());
        return new ElderMapResponse.MapRoom(
                room.getRoomId(),
                room.getName(),
                type.name(),
                new ElderMapResponse.Bounds(
                        room.getX(),
                        room.getY(),
                        DEFAULT_ROOM_WIDTH,
                        DEFAULT_ROOM_HEIGHT
                )
        );
    }

    private RoomResponse toRoomResponse(Room room) {
        return new RoomResponse(
                room.getRoomId(),
                room.getName(),
                room.getX(),
                room.getY()
        );
    }

    private ElderMapResponse.RobotPosition toRobotPosition(Robot robot, List<Room> rooms) {
        Float x = robot.getCurrentX();
        Float y = robot.getCurrentY();
        String roomId = robot.getCurrentLocation();

        Room fallbackRoom = findRoom(rooms, roomId);
        if (x == null && fallbackRoom != null) {
            x = fallbackRoom.getX();
        }
        if (y == null && fallbackRoom != null) {
            y = fallbackRoom.getY();
        }

        return new ElderMapResponse.RobotPosition(
                x == null ? 0f : x,
                y == null ? 0f : y,
                roomId,
                robot.getCurrentHeading()
        );
    }

    private Room findRoom(List<Room> rooms, String roomId) {
        if (!StringUtils.hasText(roomId)) {
            return null;
        }
        return rooms.stream()
                .filter(room -> room.getRoomId().equalsIgnoreCase(roomId))
                .findFirst()
                .orElse(null);
    }

    private LocalDateTime resolveLastUpdatedAt(Robot robot, List<Room> rooms) {
        LocalDateTime robotUpdatedAt = robot.getUpdatedAt() == null ? LocalDateTime.now() : robot.getUpdatedAt();
        return rooms.stream()
                .map(Room::getUpdatedAt)
                .filter(value -> value != null)
                .max(Comparator.naturalOrder())
                .map(value -> value.isAfter(robotUpdatedAt) ? value : robotUpdatedAt)
                .orElse(robotUpdatedAt);
    }

    private String buildMapHtml(List<Room> rooms) {
        if (rooms.isEmpty()) {
            return "<div class='room-layout empty'></div>";
        }
        StringBuilder builder = new StringBuilder("<div class='room-layout'>");
        for (Room room : rooms) {
            builder.append("<div class='room' data-room-id='")
                    .append(escapeHtml(room.getRoomId()))
                    .append("'>")
                    .append(escapeHtml(room.getName()))
                    .append("</div>");
        }
        builder.append("</div>");
        return builder.toString();
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private RoomType inferRoomType(String roomId, String roomName) {
        if (StringUtils.hasText(roomId)) {
            try {
                return RoomType.valueOf(roomId.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ignored) {
                // Fallback to name-based inference.
            }
        }

        if (StringUtils.hasText(roomName)) {
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
        }

        return RoomType.LIVING_ROOM;
    }

    private record Coordinates(
            Float x,
            Float y
    ) {
    }
}
