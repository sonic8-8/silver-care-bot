package site.silverbot.domain.robot;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import site.silverbot.domain.elder.Elder;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "robot_lcd_event")
public class RobotLcdEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "robot_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Robot robot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Elder elder;

    @Column(name = "event_type", nullable = false, length = 40)
    private String eventType;

    @Column(name = "event_action", length = 40)
    private String eventAction;

    @Column(name = "medication_id")
    private Long medicationId;

    @Column(length = 50)
    private String location;

    private Float confidence;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String payload;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private RobotLcdEvent(
            Robot robot,
            Elder elder,
            String eventType,
            String eventAction,
            Long medicationId,
            String location,
            Float confidence,
            String payload,
            LocalDateTime occurredAt
    ) {
        this.robot = robot;
        this.elder = elder;
        this.eventType = eventType;
        this.eventAction = eventAction;
        this.medicationId = medicationId;
        this.location = location;
        this.confidence = confidence;
        this.payload = payload;
        this.occurredAt = occurredAt;
    }
}
