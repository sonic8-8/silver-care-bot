package site.silverbot.domain.notification;

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
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.user.User;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Elder elder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(name = "target_path", length = 255)
    private String targetPath;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private Notification(
            User user,
            Elder elder,
            NotificationType type,
            String title,
            String message,
            String targetPath,
            Boolean isRead,
            LocalDateTime readAt
    ) {
        this.user = user;
        this.elder = elder;
        this.type = type;
        this.title = title;
        this.message = message;
        this.targetPath = targetPath;
        this.isRead = isRead == null ? false : isRead;
        this.readAt = readAt;
    }

    public boolean markRead(LocalDateTime at) {
        if (Boolean.TRUE.equals(isRead)) {
            return false;
        }
        this.isRead = true;
        this.readAt = at == null ? LocalDateTime.now() : at;
        return true;
    }
}
