package site.silverbot.domain.robot;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findAllByRobotId(Long robotId);

    List<Room> findAllByRobotIdOrderByCreatedAtAsc(Long robotId);

    Optional<Room> findByRobotIdAndRoomId(Long robotId, String roomId);

    Optional<Room> findByRobotIdAndRoomIdIgnoreCase(Long robotId, String roomId);

    boolean existsByRobotIdAndRoomId(Long robotId, String roomId);

    boolean existsByRobotIdAndRoomIdIgnoreCase(Long robotId, String roomId);
}
