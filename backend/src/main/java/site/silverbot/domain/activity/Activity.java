package site.silverbot.domain.activity;

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
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.robot.Robot;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "activity")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Elder elder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "robot_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Robot robot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ActivityType type;

    @Column(length = 100)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 50)
    private String location;

    private Float confidence;

    @Column(name = "detected_at", nullable = false)
    private LocalDateTime detectedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private Activity(
            Elder elder,
            Robot robot,
            ActivityType type,
            String title,
            String description,
            String location,
            Float confidence,
            LocalDateTime detectedAt
    ) {
        this.elder = elder;
        this.robot = robot;
        this.type = type;
        this.title = title;
        this.description = description;
        this.location = location;
        this.confidence = confidence;
        this.detectedAt = detectedAt;
    }
}
