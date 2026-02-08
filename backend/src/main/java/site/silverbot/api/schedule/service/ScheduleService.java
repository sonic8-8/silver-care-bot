package site.silverbot.api.schedule.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.common.service.CurrentUserService;
import site.silverbot.api.schedule.request.CreateScheduleRequest;
import site.silverbot.api.schedule.request.CreateVoiceScheduleRequest;
import site.silverbot.api.schedule.request.UpdateScheduleRequest;
import site.silverbot.api.schedule.response.ScheduleListResponse;
import site.silverbot.api.schedule.response.ScheduleResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.schedule.Schedule;
import site.silverbot.domain.schedule.ScheduleRepository;
import site.silverbot.domain.schedule.ScheduleSource;
import site.silverbot.domain.schedule.ScheduleType;
import site.silverbot.domain.user.User;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final ElderRepository elderRepository;
    private final CurrentUserService currentUserService;

    public ScheduleResponse createSchedule(Long elderId, CreateScheduleRequest request) {
        Elder elder = getOwnedElder(elderId);
        Schedule saved = scheduleRepository.save(Schedule.builder()
                .elder(elder)
                .title(request.title())
                .description(request.description())
                .scheduledAt(request.scheduledAt())
                .location(request.location())
                .type(request.type())
                .source(ScheduleSource.MANUAL)
                .remindBeforeMinutes(request.remindBeforeMinutes())
                .build());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ScheduleListResponse getSchedules(
            Long elderId,
            LocalDate startDate,
            LocalDate endDate,
            ScheduleType type
    ) {
        getOwnedElder(elderId);
        validateDateRange(startDate, endDate);

        Specification<Schedule> specification = byElderId(elderId)
                .and(byStartDate(startDate))
                .and(byEndDate(endDate))
                .and(byType(type));

        List<ScheduleResponse> schedules = scheduleRepository.findAll(
                        specification,
                        Sort.by(Sort.Direction.ASC, "scheduledAt")
                ).stream()
                .map(this::toResponse)
                .toList();

        return new ScheduleListResponse(schedules);
    }

    @Transactional(readOnly = true)
    public ScheduleResponse getSchedule(Long elderId, Long scheduleId) {
        getOwnedElder(elderId);
        Schedule schedule = getOwnedSchedule(elderId, scheduleId);
        return toResponse(schedule);
    }

    public ScheduleResponse updateSchedule(Long elderId, Long scheduleId, UpdateScheduleRequest request) {
        getOwnedElder(elderId);
        Schedule schedule = getOwnedSchedule(elderId, scheduleId);
        schedule.update(
                request.title(),
                request.description(),
                request.scheduledAt(),
                request.location(),
                request.type(),
                request.remindBeforeMinutes()
        );
        return toResponse(schedule);
    }

    public void deleteSchedule(Long elderId, Long scheduleId) {
        getOwnedElder(elderId);
        Schedule schedule = getOwnedSchedule(elderId, scheduleId);
        scheduleRepository.delete(schedule);
    }

    public ScheduleResponse createVoiceSchedule(Long elderId, CreateVoiceScheduleRequest request) {
        Elder elder = getOwnedElder(elderId);
        Schedule saved = scheduleRepository.save(Schedule.builder()
                .elder(elder)
                .title(request.title())
                .description(request.normalizedText())
                .scheduledAt(request.scheduledAt())
                .location(request.location())
                .type(request.type())
                .source(ScheduleSource.VOICE)
                .voiceOriginal(request.voiceOriginal())
                .normalizedText(request.normalizedText())
                .confidence(request.confidence())
                .remindBeforeMinutes(request.remindBeforeMinutes())
                .build());
        return toResponse(saved);
    }

    private Specification<Schedule> byElderId(Long elderId) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("elder").get("id"), elderId);
    }

    private Specification<Schedule> byStartDate(LocalDate startDate) {
        if (startDate == null) {
            return null;
        }
        LocalDateTime startDateTime = startDate.atStartOfDay();
        return (root, query, criteriaBuilder) -> criteriaBuilder.greaterThanOrEqualTo(
                root.get("scheduledAt"),
                startDateTime
        );
    }

    private Specification<Schedule> byEndDate(LocalDate endDate) {
        if (endDate == null) {
            return null;
        }
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        return (root, query, criteriaBuilder) -> criteriaBuilder.lessThanOrEqualTo(
                root.get("scheduledAt"),
                endDateTime
        );
    }

    private Specification<Schedule> byType(ScheduleType type) {
        if (type == null) {
            return null;
        }
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("type"), type);
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate must be greater than or equal to startDate");
        }
    }

    private Schedule getOwnedSchedule(Long elderId, Long scheduleId) {
        Schedule schedule = scheduleRepository.findByIdAndElderId(scheduleId, elderId)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found"));
        validateOwnership(schedule.getElder());
        return schedule;
    }

    private Elder getOwnedElder(Long elderId) {
        Elder elder = elderRepository.findById(elderId)
                .orElseThrow(() -> new EntityNotFoundException("Elder not found"));
        validateOwnership(elder);
        return elder;
    }

    private void validateOwnership(Elder elder) {
        User currentUser = getCurrentUser();
        if (!elder.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Schedule access denied");
        }
    }

    private User getCurrentUser() {
        return currentUserService.getCurrentUser();
    }

    private ScheduleResponse toResponse(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getElder().getId(),
                schedule.getTitle(),
                schedule.getDescription(),
                schedule.getScheduledAt(),
                schedule.getLocation(),
                schedule.getType(),
                schedule.getSource(),
                schedule.getVoiceOriginal(),
                schedule.getNormalizedText(),
                schedule.getConfidence(),
                schedule.getStatus(),
                schedule.getRemindBeforeMinutes(),
                schedule.getCreatedAt(),
                schedule.getUpdatedAt()
        );
    }
}
