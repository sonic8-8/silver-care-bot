package site.silverbot.api.dashboard.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.dashboard.repository.DashboardJdbcRepository;
import site.silverbot.api.dashboard.response.DashboardNotificationResponse;
import site.silverbot.api.dashboard.response.DashboardResponse;
import site.silverbot.api.dashboard.response.DashboardRobotStatusResponse;
import site.silverbot.api.dashboard.response.DashboardScheduleResponse;
import site.silverbot.api.dashboard.response.DashboardTodaySummaryResponse;
import site.silverbot.api.medication.model.MedicationStatus;
import site.silverbot.api.medication.model.MedicationTimeOfDay;
import site.silverbot.api.medication.repository.MedicationJdbcRepository;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.robot.Robot;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {
    private final ElderRepository elderRepository;
    private final UserRepository userRepository;
    private final RobotRepository robotRepository;
    private final MedicationJdbcRepository medicationJdbcRepository;
    private final DashboardJdbcRepository dashboardJdbcRepository;

    public DashboardResponse getDashboard(Long elderId) {
        Elder elder = getOwnedElder(elderId);
        LocalDate today = LocalDate.now();

        DashboardTodaySummaryResponse todaySummary = new DashboardTodaySummaryResponse(
                dashboardJdbcRepository.findTodayWakeUpTime(
                        elderId,
                        today.atStartOfDay(),
                        today.plusDays(1).atStartOfDay().minusNanos(1)
                ),
                resolveMedicationStatus(elderId, today),
                elder.getStatus().name()
        );

        List<DashboardNotificationResponse> notifications = dashboardJdbcRepository
                .findRecentNotifications(elderId, 5)
                .stream()
                .map(data -> new DashboardNotificationResponse(
                        data.id(),
                        data.type(),
                        data.title(),
                        data.message(),
                        data.isRead(),
                        data.createdAt()
                ))
                .toList();

        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = weekStart.plusDays(6);
        List<DashboardScheduleResponse> schedules = dashboardJdbcRepository
                .findWeeklySchedules(
                        elderId,
                        weekStart.atStartOfDay(),
                        weekEnd.plusDays(1).atStartOfDay().minusNanos(1)
                )
                .stream()
                .map(data -> new DashboardScheduleResponse(
                        data.id(),
                        data.title(),
                        data.scheduledAt(),
                        data.location(),
                        data.type(),
                        data.status()
                ))
                .toList();

        DashboardRobotStatusResponse robotStatus = robotRepository.findByElderId(elderId)
                .map(this::toRobotStatus)
                .orElse(new DashboardRobotStatusResponse(null, null, "DISCONNECTED", null, null));

        return new DashboardResponse(todaySummary, notifications, schedules, robotStatus);
    }

    private String resolveMedicationStatus(Long elderId, LocalDate today) {
        List<MedicationJdbcRepository.MedicationData> medications = medicationJdbcRepository
                .findActiveMedicationsByElderId(elderId)
                .stream()
                .filter(medication -> isActiveToday(medication, today))
                .toList();
        if (medications.isEmpty()) {
            return "등록된 약 없음";
        }

        List<MedicationJdbcRepository.MedicationRecordData> records = medicationJdbcRepository
                .findMedicationRecords(elderId, today, today);

        int expectedTotal = medications.stream()
                .mapToInt(this::expectedDoseCount)
                .sum();
        if (expectedTotal == 0) {
            return "오늘 복약 없음";
        }

        int takenCount = 0;
        int missedCount = 0;
        for (MedicationJdbcRepository.MedicationData medication : medications) {
            if (medication.frequency().includes(MedicationTimeOfDay.MORNING)) {
                MedicationStatus morningStatus = findStatus(records, medication.id(), MedicationTimeOfDay.MORNING);
                if (morningStatus == MedicationStatus.TAKEN) {
                    takenCount++;
                } else if (morningStatus == MedicationStatus.MISSED) {
                    missedCount++;
                }
            }
            if (medication.frequency().includes(MedicationTimeOfDay.EVENING)) {
                MedicationStatus eveningStatus = findStatus(records, medication.id(), MedicationTimeOfDay.EVENING);
                if (eveningStatus == MedicationStatus.TAKEN) {
                    takenCount++;
                } else if (eveningStatus == MedicationStatus.MISSED) {
                    missedCount++;
                }
            }
        }

        if (takenCount == expectedTotal) {
            return "복약 완료";
        }
        if (missedCount > 0) {
            return "복약 누락 발생";
        }
        if (takenCount > 0) {
            return String.format("%d/%d 복용 완료", takenCount, expectedTotal);
        }
        return "복약 대기";
    }

    private MedicationStatus findStatus(
            List<MedicationJdbcRepository.MedicationRecordData> records,
            Long medicationId,
            MedicationTimeOfDay timeOfDay
    ) {
        return records.stream()
                .filter(record -> record.medicationId().equals(medicationId))
                .filter(record -> record.timeOfDay() == timeOfDay)
                .map(MedicationJdbcRepository.MedicationRecordData::status)
                .findFirst()
                .orElse(MedicationStatus.PENDING);
    }

    private int expectedDoseCount(MedicationJdbcRepository.MedicationData medication) {
        return switch (medication.frequency()) {
            case MORNING, EVENING -> 1;
            case BOTH -> 2;
        };
    }

    private boolean isActiveToday(MedicationJdbcRepository.MedicationData medication, LocalDate today) {
        LocalDate startDate = medication.startDate() == null ? LocalDate.MIN : medication.startDate();
        LocalDate endDate = medication.endDate() == null ? LocalDate.MAX : medication.endDate();
        return !today.isBefore(startDate) && !today.isAfter(endDate);
    }

    private DashboardRobotStatusResponse toRobotStatus(Robot robot) {
        return new DashboardRobotStatusResponse(
                robot.getId(),
                robot.getBatteryLevel(),
                robot.getNetworkStatus().name(),
                robot.getCurrentLocation(),
                robot.getLastSyncAt()
        );
    }

    private Elder getOwnedElder(Long elderId) {
        Elder elder = elderRepository.findById(elderId)
                .orElseThrow(() -> new EntityNotFoundException("Elder not found"));
        User user = getCurrentUser();
        if (!elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Dashboard access denied");
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
}
