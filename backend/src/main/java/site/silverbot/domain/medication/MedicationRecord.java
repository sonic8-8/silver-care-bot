package site.silverbot.domain.medication;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

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
        name = "medication_record",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_medication_record",
                columnNames = {"medication_id", "record_date", "time_of_day"}
        )
)
public class MedicationRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Elder elder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Medication medication;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_of_day", nullable = false, length = 20)
    private MedicationTimeOfDay timeOfDay;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MedicationRecordStatus status;

    @Column(name = "taken_at")
    private LocalDateTime takenAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private MedicationRecordMethod method;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private MedicationRecord(
            Elder elder,
            Medication medication,
            LocalDate recordDate,
            MedicationTimeOfDay timeOfDay,
            MedicationRecordStatus status,
            LocalDateTime takenAt,
            MedicationRecordMethod method
    ) {
        if (elder != null && medication != null) {
            Long elderId = elder.getId();
            Long medicationElderId = medication.getElder() == null ? null : medication.getElder().getId();
            if (elderId != null && medicationElderId != null && !Objects.equals(elderId, medicationElderId)) {
                throw new IllegalArgumentException("Medication does not belong to elder");
            }
        }
        this.elder = elder;
        this.medication = medication;
        this.recordDate = recordDate;
        this.timeOfDay = timeOfDay;
        this.status = status == null ? MedicationRecordStatus.PENDING : status;
        this.takenAt = takenAt;
        this.method = method;
    }
}
