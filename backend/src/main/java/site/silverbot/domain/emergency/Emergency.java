package site.silverbot.domain.emergency;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.robot.Robot;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "emergency")
public class Emergency {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false)
    private Elder elder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "robot_id")
    private Robot robot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EmergencyType type;

    @Column(length = 50)
    private String location;

    private Float confidence;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sensor_data", columnDefinition = "jsonb")
    private String sensorData;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EmergencyResolution resolution = EmergencyResolution.PENDING;

    @Column(name = "resolution_note", columnDefinition = "text")
    private String resolutionNote;

    @Column(name = "detected_at", nullable = false)
    private LocalDateTime detectedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private Emergency(
            Elder elder,
            Robot robot,
            EmergencyType type,
            String location,
            Float confidence,
            String sensorData,
            EmergencyResolution resolution,
            String resolutionNote,
            LocalDateTime detectedAt,
            LocalDateTime resolvedAt
    ) {
        this.elder = elder;
        this.robot = robot;
        this.type = type;
        this.location = location;
        this.confidence = confidence;
        this.sensorData = sensorData;
        this.resolution = resolution == null ? EmergencyResolution.PENDING : resolution;
        this.resolutionNote = resolutionNote;
        this.detectedAt = detectedAt;
        this.resolvedAt = resolvedAt;
    }

    public void resolve(EmergencyResolution resolution, String note, LocalDateTime resolvedAt) {
        if (resolution != null) {
            this.resolution = resolution;
        }
        this.resolutionNote = note;
        this.resolvedAt = resolvedAt == null ? LocalDateTime.now() : resolvedAt;
    }
}
