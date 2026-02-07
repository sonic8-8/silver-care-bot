package site.silverbot.api.medication.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.silverbot.domain.medication.Medication;
import site.silverbot.domain.medication.MedicationRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MedicationValidationService {
    private final MedicationRepository medicationRepository;

    public Medication getOwnedMedication(Long elderId, Long medicationId) {
        return medicationRepository.findByIdAndElderId(medicationId, elderId)
                .orElseGet(() -> {
                    if (medicationRepository.existsById(medicationId)) {
                        throw new AccessDeniedException("Medication access denied");
                    }
                    throw new EntityNotFoundException("Medication not found");
                });
    }
}
