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
import site.silverbot.api.dashboard.response.DashboardMedicationPeriodStatusResponse;
import site.silverbot.api.dashboard.response.DashboardMedicationStatusResponse;
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
                buildMedicationStatus(elderId, today),
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

    private DashboardMedicationStatusResponse buildMedicationStatus(Long elderId, LocalDate today) {
        List<MedicationJdbcRepository.MedicationData> medications = medicationJdbcRepository
                .findActiveMedicationsByElderId(elderId)
                .stream()
                .filter(medication -> isActiveToday(medication, today))
                .toList();
        if (medications.isEmpty()) {
            return new DashboardMedicationStatusResponse(
                    new DashboardMedicationPeriodStatusResponse(0, 0, "NONE"),
                    new DashboardMedicationPeriodStatusResponse(0, 0, "NONE"),
                    0,
                    0,
                    "등록된 약 없음"
            );
        }

        List<MedicationJdbcRepository.MedicationRecordData> records = medicationJdbcRepository
                .findMedicationRecords(elderId, today, today);

        PeriodSummary morning = buildPeriodSummary(medications, records, MedicationTimeOfDay.MORNING);
        PeriodSummary evening = buildPeriodSummary(medications, records, MedicationTimeOfDay.EVENING);
        int total = morning.total() + evening.total();
        int taken = morning.taken() + evening.taken();
        int missed = morning.missed() + evening.missed();

        String label;
        if (total == 0) {
            label = "오늘 복약 없음";
        } else if (taken == total) {
            label = "복약 완료";
        } else if (missed > 0) {
            label = "복약 누락 발생";
        } else if (taken > 0) {
            label = String.format("%d/%d 복용 완료", taken, total);
        } else {
            label = "복약 대기";
        }

        return new DashboardMedicationStatusResponse(
                new DashboardMedicationPeriodStatusResponse(morning.taken(), morning.total(), morning.status()),
                new DashboardMedicationPeriodStatusResponse(evening.taken(), evening.total(), evening.status()),
                taken,
                total,
                label
        );
    }

    private PeriodSummary buildPeriodSummary(
            List<MedicationJdbcRepository.MedicationData> medications,
            List<MedicationJdbcRepository.MedicationRecordData> records,
            MedicationTimeOfDay timeOfDay
    ) {
        int total = 0;
        int taken = 0;
        int missed = 0;
        for (MedicationJdbcRepository.MedicationData medication : medications) {
            if (!medication.frequency().includes(timeOfDay)) {
                continue;
            }
            total++;
            MedicationStatus status = findStatus(records, medication.id(), timeOfDay);
            if (status == MedicationStatus.TAKEN) {
                taken++;
            } else if (status == MedicationStatus.MISSED) {
                missed++;
            }
        }

        String status;
        if (total == 0) {
            status = "NONE";
        } else if (taken == total) {
            status = "TAKEN";
        } else if (missed > 0) {
            status = "MISSED";
        } else {
            status = "PENDING";
        }
        return new PeriodSummary(taken, total, missed, status);
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

    private record PeriodSummary(
            int taken,
            int total,
            int missed,
            String status
    ) {
    }
}
