package site.silverbot.api.medication.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.medication.model.MedicationFrequency;
import site.silverbot.api.medication.model.MedicationStatus;
import site.silverbot.api.medication.model.MedicationTimeOfDay;
import site.silverbot.api.medication.repository.MedicationJdbcRepository;
import site.silverbot.api.medication.request.CreateMedicationRecordRequest;
import site.silverbot.api.medication.request.CreateMedicationRequest;
import site.silverbot.api.medication.request.UpdateMedicationRequest;
import site.silverbot.api.medication.response.DailyMedicationStatusResponse;
import site.silverbot.api.medication.response.DispenserStatusResponse;
import site.silverbot.api.medication.response.MedicationListResponse;
import site.silverbot.api.medication.response.MedicationRecordResponse;
import site.silverbot.api.medication.response.MedicationResponse;
import site.silverbot.api.medication.response.WeeklyMedicationStatusResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicationService {
    private final ElderRepository elderRepository;
    private final UserRepository userRepository;
    private final RobotRepository robotRepository;
    private final MedicationJdbcRepository medicationJdbcRepository;

    public MedicationResponse createMedication(Long elderId, CreateMedicationRequest request) {
        Elder elder = getOwnedElder(elderId);
        validateDateRange(request.startDate(), request.endDate());

        MedicationJdbcRepository.MedicationData created = medicationJdbcRepository.insertMedication(
                elder.getId(),
                request.name().trim(),
                request.dosage().trim(),
                request.frequency(),
                request.timing(),
                request.color(),
                request.startDate(),
                request.endDate(),
                true
        );
        return toResponse(created);
    }

    @Transactional(readOnly = true)
    public MedicationListResponse getMedications(Long elderId) {
        getOwnedElder(elderId);

        List<MedicationJdbcRepository.MedicationData> medications = medicationJdbcRepository
                .findAllMedicationsByElderId(elderId);
        List<MedicationJdbcRepository.MedicationData> activeMedications = medications.stream()
                .filter(MedicationJdbcRepository.MedicationData::isActive)
                .toList();

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = weekStart.plusDays(6);

        List<MedicationJdbcRepository.MedicationRecordData> weeklyRecords = medicationJdbcRepository
                .findMedicationRecords(elderId, weekStart, weekEnd);

        Set<Long> activeMedicationIds = activeMedications.stream()
                .map(MedicationJdbcRepository.MedicationData::id)
                .collect(HashSet::new, HashSet::add, HashSet::addAll);

        Map<DoseKey, MedicationStatus> recordStatusMap = indexRecordsByDose(weeklyRecords, activeMedicationIds);
        List<DoseKey> weeklyExpectedDoses = buildExpectedDoses(activeMedications, weekStart, weekEnd);

        WeeklyMedicationStatusResponse weeklyStatus = buildWeeklyStatus(recordStatusMap, weeklyExpectedDoses, today);
        List<DailyMedicationStatusResponse> dailyStatuses = buildDailyStatuses(recordStatusMap, weeklyExpectedDoses, today,
                weekStart, weekEnd);
        DispenserStatusResponse dispenserStatus = buildDispenserStatus(elderId, activeMedications);

        List<MedicationResponse> medicationResponses = medications.stream().map(this::toResponse).toList();

        return new MedicationListResponse(weeklyStatus, dailyStatuses, medicationResponses, dispenserStatus);
    }

    @Transactional(readOnly = true)
    public MedicationResponse getMedication(Long elderId, Long medicationId) {
        getOwnedElder(elderId);
        MedicationJdbcRepository.MedicationData medication = medicationJdbcRepository
                .findMedicationByIdAndElderId(elderId, medicationId)
                .orElseThrow(() -> new EntityNotFoundException("Medication not found"));
        return toResponse(medication);
    }

    public MedicationResponse updateMedication(Long elderId, Long medicationId, UpdateMedicationRequest request) {
        getOwnedElder(elderId);
        MedicationJdbcRepository.MedicationData medication = medicationJdbcRepository
                .findMedicationByIdAndElderId(elderId, medicationId)
                .orElseThrow(() -> new EntityNotFoundException("Medication not found"));

        String name = resolveUpdatedRequiredText(request.name(), medication.name(), "name");
        String dosage = resolveUpdatedRequiredText(request.dosage(), medication.dosage(), "dosage");
        MedicationFrequency frequency = request.frequency() == null ? medication.frequency() : request.frequency();
        String timing = request.timing() == null ? medication.timing() : request.timing();
        String color = request.color() == null ? medication.color() : request.color();
        LocalDate startDate = request.startDate() == null ? medication.startDate() : request.startDate();
        LocalDate endDate = request.endDate() == null ? medication.endDate() : request.endDate();
        boolean isActive = request.isActive() == null ? medication.isActive() : request.isActive();

        validateDateRange(startDate, endDate);

        MedicationJdbcRepository.MedicationData updated = medicationJdbcRepository.updateMedication(
                new MedicationJdbcRepository.MedicationData(
                        medication.id(),
                        medication.elderId(),
                        name,
                        dosage,
                        frequency,
                        timing,
                        color,
                        startDate,
                        endDate,
                        isActive,
                        medication.createdAt(),
                        medication.updatedAt()
                )
        );

        return toResponse(updated);
    }

    public void deleteMedication(Long elderId, Long medicationId) {
        getOwnedElder(elderId);
        medicationJdbcRepository.findMedicationByIdAndElderId(elderId, medicationId)
                .orElseThrow(() -> new EntityNotFoundException("Medication not found"));
        medicationJdbcRepository.deleteMedication(elderId, medicationId);
    }

    public MedicationRecordResponse createMedicationRecord(Long elderId, CreateMedicationRecordRequest request) {
        getOwnedElder(elderId);

        if (request.status() == MedicationStatus.PENDING) {
            throw new IllegalArgumentException("PENDING cannot be persisted as a medication record");
        }

        MedicationJdbcRepository.MedicationData medication = medicationJdbcRepository
                .findMedicationByIdAndElderId(elderId, request.medicationId())
                .orElseThrow(() -> new EntityNotFoundException("Medication not found"));

        LocalDateTime takenAt = request.takenAt() == null ? LocalDateTime.now() : request.takenAt().toLocalDateTime();
        MedicationTimeOfDay timeOfDay = request.timeOfDay() == null
                ? MedicationTimeOfDay.from(takenAt)
                : request.timeOfDay();

        if (!medication.frequency().includes(timeOfDay)) {
            throw new IllegalArgumentException("Medication frequency does not match record time-of-day");
        }

        MedicationJdbcRepository.MedicationRecordData saved = medicationJdbcRepository.upsertMedicationRecord(
                elderId,
                medication.id(),
                takenAt.toLocalDate(),
                timeOfDay,
                request.status(),
                takenAt,
                request.method()
        );

        return toRecordResponse(saved);
    }

    private WeeklyMedicationStatusResponse buildWeeklyStatus(
            Map<DoseKey, MedicationStatus> recordStatusMap,
            List<DoseKey> expectedDoses,
            LocalDate today
    ) {
        int taken = 0;
        int missed = 0;

        for (DoseKey key : expectedDoses) {
            if (key.date().isAfter(today)) {
                continue;
            }
            MedicationStatus status = recordStatusMap.get(key);
            if (status == MedicationStatus.TAKEN) {
                taken++;
            } else {
                missed++;
            }
        }

        int total = taken + missed;
        double rate = total == 0 ? 0.0 : round((double) taken * 100.0 / total);
        return new WeeklyMedicationStatusResponse(taken, missed, total, rate);
    }

    private List<DailyMedicationStatusResponse> buildDailyStatuses(
            Map<DoseKey, MedicationStatus> recordStatusMap,
            List<DoseKey> expectedDoses,
            LocalDate today,
            LocalDate weekStart,
            LocalDate weekEnd
    ) {
        Map<LocalDate, Map<MedicationTimeOfDay, List<DoseKey>>> grouped = new LinkedHashMap<>();
        LocalDate cursor = weekStart;
        while (!cursor.isAfter(weekEnd)) {
            Map<MedicationTimeOfDay, List<DoseKey>> byTime = new EnumMap<>(MedicationTimeOfDay.class);
            byTime.put(MedicationTimeOfDay.MORNING, new ArrayList<>());
            byTime.put(MedicationTimeOfDay.EVENING, new ArrayList<>());
            grouped.put(cursor, byTime);
            cursor = cursor.plusDays(1);
        }

        for (DoseKey key : expectedDoses) {
            Map<MedicationTimeOfDay, List<DoseKey>> byTime = grouped.get(key.date());
            if (byTime != null) {
                byTime.get(key.timeOfDay()).add(key);
            }
        }

        List<DailyMedicationStatusResponse> result = new ArrayList<>();
        for (Map.Entry<LocalDate, Map<MedicationTimeOfDay, List<DoseKey>>> entry : grouped.entrySet()) {
            LocalDate date = entry.getKey();
            MedicationStatus morning = resolveDoseGroupStatus(
                    entry.getValue().getOrDefault(MedicationTimeOfDay.MORNING, List.of()),
                    recordStatusMap,
                    date,
                    today
            );
            MedicationStatus evening = resolveDoseGroupStatus(
                    entry.getValue().getOrDefault(MedicationTimeOfDay.EVENING, List.of()),
                    recordStatusMap,
                    date,
                    today
            );
            result.add(new DailyMedicationStatusResponse(date.getDayOfWeek().name(), morning, evening));
        }

        return result;
    }

    private MedicationStatus resolveDoseGroupStatus(
            List<DoseKey> keys,
            Map<DoseKey, MedicationStatus> recordStatusMap,
            LocalDate date,
            LocalDate today
    ) {
        if (keys.isEmpty()) {
            return MedicationStatus.PENDING;
        }

        boolean allTaken = true;
        for (DoseKey key : keys) {
            MedicationStatus status = recordStatusMap.get(key);
            if (status == MedicationStatus.MISSED) {
                return MedicationStatus.MISSED;
            }
            if (status != MedicationStatus.TAKEN) {
                allTaken = false;
            }
        }

        if (allTaken) {
            return MedicationStatus.TAKEN;
        }
        if (date.isBefore(today)) {
            return MedicationStatus.MISSED;
        }
        return MedicationStatus.PENDING;
    }

    private Map<DoseKey, MedicationStatus> indexRecordsByDose(
            List<MedicationJdbcRepository.MedicationRecordData> records,
            Set<Long> activeMedicationIds
    ) {
        Map<DoseKey, MedicationStatus> indexed = new HashMap<>();
        for (MedicationJdbcRepository.MedicationRecordData record : records) {
            if (!activeMedicationIds.contains(record.medicationId())) {
                continue;
            }
            DoseKey key = new DoseKey(record.medicationId(), record.recordDate(), record.timeOfDay());
            indexed.put(key, record.status());
        }
        return indexed;
    }

    private List<DoseKey> buildExpectedDoses(
            List<MedicationJdbcRepository.MedicationData> medications,
            LocalDate startDate,
            LocalDate endDate
    ) {
        List<DoseKey> expected = new ArrayList<>();
        for (MedicationJdbcRepository.MedicationData medication : medications) {
            LocalDate effectiveStart = medication.startDate() == null ? LocalDate.MIN : medication.startDate();
            LocalDate effectiveEnd = medication.endDate() == null ? LocalDate.MAX : medication.endDate();

            LocalDate cursor = startDate;
            while (!cursor.isAfter(endDate)) {
                if (!cursor.isBefore(effectiveStart) && !cursor.isAfter(effectiveEnd)) {
                    if (medication.frequency().includes(MedicationTimeOfDay.MORNING)) {
                        expected.add(new DoseKey(medication.id(), cursor, MedicationTimeOfDay.MORNING));
                    }
                    if (medication.frequency().includes(MedicationTimeOfDay.EVENING)) {
                        expected.add(new DoseKey(medication.id(), cursor, MedicationTimeOfDay.EVENING));
                    }
                }
                cursor = cursor.plusDays(1);
            }
        }
        return expected;
    }

    private DispenserStatusResponse buildDispenserStatus(
            Long elderId,
            List<MedicationJdbcRepository.MedicationData> activeMedications
    ) {
        Optional<Robot> robot = robotRepository.findByElderId(elderId);
        if (robot.isEmpty()) {
            return new DispenserStatusResponse(null, null, false, null);
        }

        Integer remaining = robot.get().getDispenserRemaining();
        Integer capacity = robot.get().getDispenserCapacity();
        LocalDate today = LocalDate.now();

        List<MedicationJdbcRepository.MedicationData> validTodayMedications = activeMedications.stream()
                .filter(medication -> isEffectiveOn(medication, today))
                .toList();

        int dailyDoseCount = validTodayMedications.stream()
                .mapToInt(this::dailyDoseCount)
                .sum();

        Integer daysUntilEmpty = null;
        if (remaining != null && dailyDoseCount > 0) {
            daysUntilEmpty = (int) Math.ceil((double) remaining / dailyDoseCount);
        }

        boolean needsRefill = false;
        if (daysUntilEmpty != null) {
            needsRefill = daysUntilEmpty <= 2;
        }

        return new DispenserStatusResponse(remaining, capacity, needsRefill, daysUntilEmpty);
    }

    private int dailyDoseCount(MedicationJdbcRepository.MedicationData medication) {
        return switch (medication.frequency()) {
            case MORNING, EVENING -> 1;
            case BOTH -> 2;
        };
    }

    private MedicationResponse toResponse(MedicationJdbcRepository.MedicationData medication) {
        return new MedicationResponse(
                medication.id(),
                medication.name(),
                medication.dosage(),
                medication.frequency(),
                medication.timing(),
                medication.color(),
                medication.startDate(),
                medication.endDate(),
                medication.isActive()
        );
    }

    private MedicationRecordResponse toRecordResponse(MedicationJdbcRepository.MedicationRecordData record) {
        return new MedicationRecordResponse(
                record.id(),
                record.medicationId(),
                record.recordDate(),
                record.timeOfDay(),
                record.status(),
                record.takenAt(),
                record.method()
        );
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate must be on or after startDate");
        }
    }

    private String resolveUpdatedRequiredText(String requestValue, String currentValue, String fieldName) {
        if (requestValue == null) {
            return currentValue;
        }
        if (requestValue.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return requestValue.trim();
    }

    private boolean isEffectiveOn(MedicationJdbcRepository.MedicationData medication, LocalDate date) {
        LocalDate startDate = medication.startDate() == null ? LocalDate.MIN : medication.startDate();
        LocalDate endDate = medication.endDate() == null ? LocalDate.MAX : medication.endDate();
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    private Elder getOwnedElder(Long elderId) {
        Elder elder = elderRepository.findById(elderId)
                .orElseThrow(() -> new EntityNotFoundException("Elder not found"));
        User user = getCurrentUser();
        if (!elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Medication access denied");
        }
        return elder;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }

        String principal = authentication.getName();
        Optional<User> byEmail = userRepository.findByEmail(principal);
        if (byEmail.isPresent()) {
            return byEmail.get();
        }

        try {
            long userId = Long.parseLong(principal);
            return userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
        } catch (NumberFormatException ex) {
            throw new EntityNotFoundException("User not found");
        }
    }

    private double round(double value) {
        return BigDecimal.valueOf(value)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private record DoseKey(
            Long medicationId,
            LocalDate date,
            MedicationTimeOfDay timeOfDay
    ) {
    }
}
