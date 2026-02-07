package site.silverbot.domain.patrol;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
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
@Table(name = "patrol_result")
public class PatrolResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "robot_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Robot robot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Elder elder;

    @Column(name = "patrol_id", nullable = false, unique = true, length = 50)
    private String patrolId;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_status", nullable = false, length = 20)
    private PatrolOverallStatus overallStatus;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "patrolResult", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("checkedAt ASC")
    private List<PatrolItem> items = new ArrayList<>();

    @Builder
    private PatrolResult(
            Robot robot,
            Elder elder,
            String patrolId,
            PatrolOverallStatus overallStatus,
            LocalDateTime startedAt,
            LocalDateTime completedAt
    ) {
        this.robot = robot;
        this.elder = elder;
        this.patrolId = patrolId;
        this.overallStatus = overallStatus == null ? PatrolOverallStatus.SAFE : overallStatus;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
    }

    public void addItem(PatrolItem item) {
        items.add(item);
    }
}
