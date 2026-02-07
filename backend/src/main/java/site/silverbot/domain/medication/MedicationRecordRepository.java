package site.silverbot.domain.medication;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicationRecordRepository extends JpaRepository<MedicationRecord, Long> {
}
