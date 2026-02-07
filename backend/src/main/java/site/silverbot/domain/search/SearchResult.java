package site.silverbot.domain.search;

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
import site.silverbot.domain.conversation.Conversation;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.robot.Robot;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "search_result")
public class SearchResult {
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Conversation conversation;

    @Enumerated(EnumType.STRING)
    @Column(name = "search_type", nullable = false, length = 20)
    private SearchType searchType;

    @Column(columnDefinition = "text")
    private String query;

    @Column(columnDefinition = "text")
    private String content;

    @Column(name = "searched_at", nullable = false)
    private LocalDateTime searchedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private SearchResult(
            Robot robot,
            Elder elder,
            Conversation conversation,
            SearchType searchType,
            String query,
            String content,
            LocalDateTime searchedAt
    ) {
        this.robot = robot;
        this.elder = elder;
        this.conversation = conversation;
        this.searchType = searchType;
        this.query = query;
        this.content = content;
        this.searchedAt = searchedAt;
    }
}
