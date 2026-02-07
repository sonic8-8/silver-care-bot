package site.silverbot.domain.patrol;

import java.time.LocalDateTime;

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
@Table(name = "patrol_item")
public class PatrolItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patrol_result_id", nullable = false)
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

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "checked_at", nullable = false)
    private LocalDateTime checkedAt;

    @Builder
    private PatrolItem(
            PatrolResult patrolResult,
            PatrolTarget target,
            String label,
            PatrolItemStatus status,
            Float confidence,
            String imageUrl,
            LocalDateTime checkedAt
    ) {
        this.patrolResult = patrolResult;
        this.target = target;
        this.label = label;
        this.status = status;
        this.confidence = confidence;
        this.imageUrl = imageUrl;
        this.checkedAt = checkedAt;
    }
}
