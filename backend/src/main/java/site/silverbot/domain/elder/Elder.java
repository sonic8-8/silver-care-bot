package site.silverbot.domain.elder;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
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
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.silverbot.domain.user.User;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "elder")
public class Elder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(length = 255)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ElderStatus status = ElderStatus.SAFE;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @Column(name = "last_location", length = 50)
    private String lastLocation;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private Elder(
            User user,
            String name,
            LocalDate birthDate,
            Gender gender,
            String address,
            ElderStatus status,
            LocalDateTime lastActivityAt,
            String lastLocation
    ) {
        this.user = user;
        this.name = name;
        this.birthDate = birthDate;
        this.gender = gender;
        this.address = address;
        this.status = status == null ? ElderStatus.SAFE : status;
        this.lastActivityAt = lastActivityAt;
        this.lastLocation = lastLocation;
    }

    public void updateInfo(String name, LocalDate birthDate, Gender gender, String address) {
        if (name != null) {
            this.name = name;
        }
        if (birthDate != null) {
            this.birthDate = birthDate;
        }
        if (gender != null) {
            this.gender = gender;
        }
        if (address != null) {
            this.address = address;
        }
    }

    public void updateStatus(ElderStatus status) {
        if (status != null) {
            this.status = status;
        }
    }

    public void updateLastActivity(LocalDateTime lastActivityAt, String lastLocation) {
        if (lastActivityAt != null) {
            this.lastActivityAt = lastActivityAt;
        }
        if (lastLocation != null) {
            this.lastLocation = lastLocation;
        }
    }
}
