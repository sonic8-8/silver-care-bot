package site.silverbot.domain.conversation;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
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
@Table(name = "conversation")
public class Conversation {
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

    @Column(name = "voice_original", columnDefinition = "text")
    private String voiceOriginal;

    @Column(name = "normalized_text", columnDefinition = "text")
    private String normalizedText;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ConversationIntent intent;

    @Enumerated(EnumType.STRING)
    @Column(name = "command_type", length = 20)
    private ConversationCommandType commandType;

    private Float confidence;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConversationSentiment sentiment = ConversationSentiment.NEUTRAL;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String keywords;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private Conversation(
            Robot robot,
            Elder elder,
            String voiceOriginal,
            String normalizedText,
            ConversationIntent intent,
            ConversationCommandType commandType,
            Float confidence,
            Integer durationSeconds,
            ConversationSentiment sentiment,
            String keywords,
            LocalDateTime recordedAt
    ) {
        this.robot = robot;
        this.elder = elder;
        this.voiceOriginal = voiceOriginal;
        this.normalizedText = normalizedText;
        this.intent = intent;
        this.commandType = commandType;
        this.confidence = confidence;
        this.durationSeconds = durationSeconds;
        this.sentiment = sentiment == null ? ConversationSentiment.NEUTRAL : sentiment;
        this.keywords = keywords;
        this.recordedAt = recordedAt;
    }
}
