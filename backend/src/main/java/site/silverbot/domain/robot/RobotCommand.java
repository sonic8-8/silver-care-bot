package site.silverbot.domain.robot;

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

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "robot_command")
public class RobotCommand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "robot_id", nullable = false)
    private Robot robot;

    @Column(name = "command_id", nullable = false, length = 50, unique = true)
    private String commandId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CommandType command;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String params;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommandStatus status = CommandStatus.PENDING;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String result;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private RobotCommand(
            Robot robot,
            String commandId,
            CommandType command,
            String params,
            CommandStatus status,
            String result,
            LocalDateTime issuedAt,
            LocalDateTime completedAt
    ) {
        this.robot = robot;
        this.commandId = commandId;
        this.command = command;
        this.params = params;
        this.status = status == null ? CommandStatus.PENDING : status;
        this.result = result;
        this.issuedAt = issuedAt;
        this.completedAt = completedAt;
    }

    public void markStatus(CommandStatus status) {
        if (status != null) {
            this.status = status;
        }
    }

    public void markReceived() {
        this.status = CommandStatus.RECEIVED;
    }
}
