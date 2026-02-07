package site.silverbot.domain.medication;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UpdateTimestamp;

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
        name = "medication",
        uniqueConstraints = @UniqueConstraint(name = "uk_medication_id_elder", columnNames = {"id", "elder_id"})
)
public class Medication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "elder_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Elder elder;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String dosage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MedicationFrequency frequency;

    @Column(length = 50)
    private String timing;

    @Column(length = 20)
    private String color;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private Medication(
            Elder elder,
            String name,
            String dosage,
            MedicationFrequency frequency,
            String timing,
            String color,
            LocalDate startDate,
            LocalDate endDate,
            Boolean isActive
    ) {
        this.elder = elder;
        this.name = name;
        this.dosage = dosage;
        this.frequency = frequency;
        this.timing = timing;
        this.color = color;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = isActive == null ? true : isActive;
    }

    public void deactivate() {
        this.isActive = false;
    }
}
