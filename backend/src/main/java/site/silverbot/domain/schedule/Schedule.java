package site.silverbot.domain.schedule;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
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
import site.silverbot.domain.elder.Elder;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "schedule")
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Elder elder;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduleType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduleSource source;

    @Column(name = "voice_original", columnDefinition = "text")
    private String voiceOriginal;

    @Column(name = "normalized_text", columnDefinition = "text")
    private String normalizedText;

    private Float confidence;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduleStatus status = ScheduleStatus.UPCOMING;

    @Column(name = "remind_before_minutes", nullable = false)
    private Integer remindBeforeMinutes = 60;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private Schedule(
            Elder elder,
            String title,
            String description,
            LocalDateTime scheduledAt,
            String location,
            ScheduleType type,
            ScheduleSource source,
            String voiceOriginal,
            String normalizedText,
            Float confidence,
            ScheduleStatus status,
            Integer remindBeforeMinutes
    ) {
        this.elder = elder;
        this.title = title;
        this.description = description;
        this.scheduledAt = scheduledAt;
        this.location = location;
        this.type = type;
        this.source = source == null ? ScheduleSource.MANUAL : source;
        this.voiceOriginal = voiceOriginal;
        this.normalizedText = normalizedText;
        this.confidence = confidence;
        this.status = status == null ? ScheduleStatus.UPCOMING : status;
        this.remindBeforeMinutes = remindBeforeMinutes == null ? 60 : remindBeforeMinutes;
    }

    public void update(
            String title,
            String description,
            LocalDateTime scheduledAt,
            String location,
            ScheduleType type,
            Integer remindBeforeMinutes
    ) {
        if (title != null) {
            this.title = title;
        }
        if (description != null) {
            this.description = description;
        }
        if (scheduledAt != null) {
            this.scheduledAt = scheduledAt;
        }
        if (location != null) {
            this.location = location;
        }
        if (type != null) {
            this.type = type;
        }
        if (remindBeforeMinutes != null) {
            this.remindBeforeMinutes = remindBeforeMinutes;
        }
    }
}
