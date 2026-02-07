package site.silverbot.domain.patrol;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

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
@Table(name = "patrol_snapshot")
public class PatrolSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patrol_result_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private PatrolResult patrolResult;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PatrolTarget target;

    @Column(length = 50)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PatrolItemStatus status;

    private Float confidence;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "captured_at", nullable = false)
    private LocalDateTime capturedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private PatrolSnapshot(
            PatrolResult patrolResult,
            PatrolTarget target,
            String label,
            PatrolItemStatus status,
            Float confidence,
            String imageUrl,
            LocalDateTime capturedAt
    ) {
        this.patrolResult = patrolResult;
        this.target = target;
        this.label = label;
        this.status = status;
        this.confidence = confidence;
        this.imageUrl = imageUrl;
        this.capturedAt = capturedAt;
    }
}
