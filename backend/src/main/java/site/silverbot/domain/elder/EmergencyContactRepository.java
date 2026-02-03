package site.silverbot.domain.elder;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findAllByElderIdOrderByPriorityAsc(Long elderId);
}
