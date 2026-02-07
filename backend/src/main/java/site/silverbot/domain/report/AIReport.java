package site.silverbot.domain.report;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.silverbot.domain.elder.Elder;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "ai_report",
        uniqueConstraints = @UniqueConstraint(name = "uk_ai_report_elder_period", columnNames = {
                "elder_id",
                "period_start",
                "period_end"
        })
)
public class AIReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Elder elder;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(columnDefinition = "text")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metrics;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "top_keywords", columnDefinition = "jsonb")
    private String topKeywords;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String recommendations;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private AIReport(
            Elder elder,
            LocalDate reportDate,
            LocalDate periodStart,
            LocalDate periodEnd,
            String summary,
            String metrics,
            String topKeywords,
            String recommendations,
            LocalDateTime generatedAt
    ) {
        this.elder = elder;
        this.reportDate = reportDate;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.summary = summary;
        this.metrics = metrics;
        this.topKeywords = topKeywords;
        this.recommendations = recommendations;
        this.generatedAt = generatedAt;
    }
}
