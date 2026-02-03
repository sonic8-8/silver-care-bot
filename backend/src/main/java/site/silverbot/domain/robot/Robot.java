package site.silverbot.domain.robot;

import java.time.LocalDateTime;
import java.time.LocalTime;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.silverbot.domain.elder.Elder;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "robot")
public class Robot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id")
    private Elder elder;

    @Column(name = "serial_number", nullable = false, length = 50, unique = true)
    private String serialNumber;

    @Column(name = "auth_code", length = 10)
    private String authCode;

    @Column(name = "battery_level", nullable = false)
    private Integer batteryLevel = 100;

    @Column(name = "is_charging", nullable = false)
    private Boolean isCharging = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "network_status", nullable = false, length = 20)
    private NetworkStatus networkStatus = NetworkStatus.DISCONNECTED;

    @Column(name = "current_location", length = 50)
    private String currentLocation;

    @Column(name = "current_x")
    private Float currentX;

    @Column(name = "current_y")
    private Float currentY;

    @Column(name = "current_heading")
    private Integer currentHeading;

    @Enumerated(EnumType.STRING)
    @Column(name = "lcd_mode", nullable = false, length = 20)
    private LcdMode lcdMode = LcdMode.IDLE;

    @Enumerated(EnumType.STRING)
    @Column(name = "lcd_emotion", nullable = false, length = 20)
    private LcdEmotion lcdEmotion = LcdEmotion.NEUTRAL;

    @Column(name = "lcd_message", length = 255)
    private String lcdMessage;

    @Column(name = "lcd_sub_message", length = 255)
    private String lcdSubMessage;

    @Column(name = "dispenser_remaining", nullable = false)
    private Integer dispenserRemaining = 0;

    @Column(name = "dispenser_capacity", nullable = false)
    private Integer dispenserCapacity = 7;

    @Column(name = "morning_medication_time", nullable = false)
    private LocalTime morningMedicationTime = LocalTime.of(8, 0);

    @Column(name = "evening_medication_time", nullable = false)
    private LocalTime eveningMedicationTime = LocalTime.of(19, 0);

    @Column(name = "tts_volume", nullable = false)
    private Integer ttsVolume = 70;

    @Column(name = "patrol_start_time", nullable = false)
    private LocalTime patrolStartTime = LocalTime.of(9, 0);

    @Column(name = "patrol_end_time", nullable = false)
    private LocalTime patrolEndTime = LocalTime.of(18, 0);

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private Robot(
            Elder elder,
            String serialNumber,
            String authCode,
            Integer batteryLevel,
            Boolean isCharging,
            NetworkStatus networkStatus,
            String currentLocation,
            Float currentX,
            Float currentY,
            Integer currentHeading,
            LcdMode lcdMode,
            LcdEmotion lcdEmotion,
            String lcdMessage,
            String lcdSubMessage,
            Integer dispenserRemaining,
            Integer dispenserCapacity,
            LocalTime morningMedicationTime,
            LocalTime eveningMedicationTime,
            Integer ttsVolume,
            LocalTime patrolStartTime,
            LocalTime patrolEndTime,
            LocalDateTime lastSyncAt
    ) {
        this.elder = elder;
        this.serialNumber = serialNumber;
        this.authCode = authCode;
        this.batteryLevel = batteryLevel == null ? 100 : batteryLevel;
        this.isCharging = isCharging == null ? false : isCharging;
        this.networkStatus = networkStatus == null ? NetworkStatus.DISCONNECTED : networkStatus;
        this.currentLocation = currentLocation;
        this.currentX = currentX;
        this.currentY = currentY;
        this.currentHeading = currentHeading;
        this.lcdMode = lcdMode == null ? LcdMode.IDLE : lcdMode;
        this.lcdEmotion = lcdEmotion == null ? LcdEmotion.NEUTRAL : lcdEmotion;
        this.lcdMessage = lcdMessage;
        this.lcdSubMessage = lcdSubMessage;
        this.dispenserRemaining = dispenserRemaining == null ? 0 : dispenserRemaining;
        this.dispenserCapacity = dispenserCapacity == null ? 7 : dispenserCapacity;
        this.morningMedicationTime = morningMedicationTime == null ? LocalTime.of(8, 0) : morningMedicationTime;
        this.eveningMedicationTime = eveningMedicationTime == null ? LocalTime.of(19, 0) : eveningMedicationTime;
        this.ttsVolume = ttsVolume == null ? 70 : ttsVolume;
        this.patrolStartTime = patrolStartTime == null ? LocalTime.of(9, 0) : patrolStartTime;
        this.patrolEndTime = patrolEndTime == null ? LocalTime.of(18, 0) : patrolEndTime;
        this.lastSyncAt = lastSyncAt;
    }
}
