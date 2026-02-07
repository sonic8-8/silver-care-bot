package site.silverbot.domain.robot;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "room")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "robot_id", nullable = false)
    private Robot robot;

    @Column(name = "room_id", nullable = false, length = 50)
    private String roomId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private Float x;

    @Column(nullable = false)
    private Float y;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", length = 20)
    private RoomType roomType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private Room(
            Robot robot,
            String roomId,
            String name,
            Float x,
            Float y,
            RoomType roomType
    ) {
        this.robot = robot;
        this.roomId = roomId;
        this.name = name;
        this.x = x;
        this.y = y;
        this.roomType = roomType;
    }

    public void updateName(String name) {
        if (name != null) {
            this.name = name;
        }
    }

    public void updateCoordinate(Float x, Float y) {
        if (x != null) {
            this.x = x;
        }
        if (y != null) {
            this.y = y;
        }
    }

    public void updateRoomType(RoomType roomType) {
        if (roomType != null) {
            this.roomType = roomType;
        }
    }
}
