package site.silverbot.domain.medication;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicationRepository extends JpaRepository<Medication, Long> {
    boolean existsByIdAndElderId(Long id, Long elderId);

    Optional<Medication> findByIdAndElderId(Long id, Long elderId);
}
