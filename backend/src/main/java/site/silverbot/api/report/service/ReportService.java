package site.silverbot.api.report.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.activity.repository.ActivityJdbcRepository;
import site.silverbot.api.medication.model.MedicationStatus;
import site.silverbot.api.medication.model.MedicationTimeOfDay;
import site.silverbot.api.medication.repository.MedicationJdbcRepository;
import site.silverbot.api.report.repository.ReportJdbcRepository;
import site.silverbot.api.report.response.WeeklyReportResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };
    private static final TypeReference<List<String>> STRING_LIST_TYPE = new TypeReference<>() {
    };

    private final ElderRepository elderRepository;
    private final UserRepository userRepository;
    private final MedicationJdbcRepository medicationJdbcRepository;
    private final ActivityJdbcRepository activityJdbcRepository;
    private final ReportJdbcRepository reportJdbcRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public WeeklyReportResponse getWeeklyReport(Long elderId, LocalDate weekStartDate) {
        Elder elder = getOwnedElder(elderId);
        LocalDate weekStart = resolveWeekStart(weekStartDate);
        LocalDate weekEnd = weekStart.plusDays(6);

        Optional<ReportJdbcRepository.WeeklyReportData> stored = reportJdbcRepository
                .findWeeklyReport(elder.getId(), weekStart, weekEnd);
        if (stored.isPresent()) {
            return toStoredResponse(stored.get());
        }

        GeneratedWeeklyReport generated = generateWeeklyReportData(elder.getId(), weekStart);
        return generated.toResponse("CALCULATED");
    }

    public void generateWeeklyReportsForAllElders(LocalDate weekStartDate) {
        LocalDate weekStart = resolveWeekStart(weekStartDate);
        List<Long> elderIds = elderRepository.findAll()
                .stream()
                .map(Elder::getId)
                .toList();

        for (Long elderId : elderIds) {
            GeneratedWeeklyReport generated = generateWeeklyReportData(elderId, weekStart);
            reportJdbcRepository.saveWeeklyReport(
                    elderId,
                    generated.weekEndDate(),
                    generated.weekStartDate(),
                    generated.weekEndDate(),
                    buildSummary(generated),
                    writeJson(Map.of(
                            "medicationRate", generated.medicationRate(),
                            "activityCount", generated.activityCount()
                    )),
                    writeJson(generated.conversationKeywords()),
                    writeJson(generated.recommendations()),
                    generated.generatedAt()
            );
        }
    }

    private GeneratedWeeklyReport generateWeeklyReportData(Long elderId, LocalDate weekStartDate) {
        LocalDate weekEndDate = weekStartDate.plusDays(6);

        double medicationRate = calculateMedicationRate(elderId, weekStartDate, weekEndDate);
        long activityCount = activityJdbcRepository.countByElderAndRange(
                elderId,
                weekStartDate.atStartOfDay(),
                weekEndDate.plusDays(1).atStartOfDay().minusNanos(1)
        );
        List<String> conversationKeywords = List.of();
        List<String> recommendations = buildRecommendations(medicationRate, activityCount);

        return new GeneratedWeeklyReport(
                weekStartDate,
                weekEndDate,
                medicationRate,
                activityCount,
                conversationKeywords,
                recommendations,
                LocalDateTime.now()
        );
    }

    private double calculateMedicationRate(Long elderId, LocalDate weekStartDate, LocalDate weekEndDate) {
        List<MedicationJdbcRepository.MedicationData> medications = medicationJdbcRepository
                .findActiveMedicationsByElderId(elderId)
                .stream()
                .filter(medication -> overlapsWeek(medication, weekStartDate, weekEndDate))
                .toList();
        if (medications.isEmpty()) {
            return 0.0;
        }

        List<MedicationJdbcRepository.MedicationRecordData> records = medicationJdbcRepository
                .findMedicationRecords(elderId, weekStartDate, weekEndDate);

        Map<Long, MedicationJdbcRepository.MedicationData> medicationMap = medications.stream()
                .collect(Collectors.toMap(MedicationJdbcRepository.MedicationData::id, medication -> medication));

        int expectedCount = 0;
        int takenCount = 0;
        LocalDate cursor = weekStartDate;
        while (!cursor.isAfter(weekEndDate)) {
            for (MedicationJdbcRepository.MedicationData medication : medications) {
                if (!isActiveOnDate(medication, cursor)) {
                    continue;
                }
                if (medication.frequency().includes(MedicationTimeOfDay.MORNING)) {
                    expectedCount++;
                }
                if (medication.frequency().includes(MedicationTimeOfDay.EVENING)) {
                    expectedCount++;
                }
            }
            cursor = cursor.plusDays(1);
        }
        if (expectedCount == 0) {
            return 0.0;
        }

        for (MedicationJdbcRepository.MedicationRecordData record : records) {
            MedicationJdbcRepository.MedicationData medication = medicationMap.get(record.medicationId());
            if (medication == null) {
                continue;
            }
            if (!isActiveOnDate(medication, record.recordDate())) {
                continue;
            }
            if (!medication.frequency().includes(record.timeOfDay())) {
                continue;
            }
            if (record.status() == MedicationStatus.TAKEN) {
                takenCount++;
            }
        }

        return Math.round(((double) takenCount / expectedCount) * 1000.0) / 10.0;
    }

    private List<String> buildRecommendations(double medicationRate, long activityCount) {
        List<String> recommendations = new ArrayList<>();
        if (medicationRate < 80.0) {
            recommendations.add("복약 알림 확인을 강화해 주세요.");
        }
        if (activityCount < 7) {
            recommendations.add("어르신 활동량이 낮아 상태 점검이 필요합니다.");
        }
        if (recommendations.isEmpty()) {
            recommendations.add("현재 패턴이 안정적입니다. 기존 케어 루틴을 유지해 주세요.");
        }
        return recommendations;
    }

    private String buildSummary(GeneratedWeeklyReport generated) {
        return "주간 복약률 " + generated.medicationRate() + "% / 활동 " + generated.activityCount() + "건";
    }

    private boolean overlapsWeek(
            MedicationJdbcRepository.MedicationData medication,
            LocalDate weekStartDate,
            LocalDate weekEndDate
    ) {
        LocalDate startDate = medication.startDate() == null ? LocalDate.MIN : medication.startDate();
        LocalDate endDate = medication.endDate() == null ? LocalDate.MAX : medication.endDate();
        return !(endDate.isBefore(weekStartDate) || startDate.isAfter(weekEndDate));
    }

    private boolean isActiveOnDate(MedicationJdbcRepository.MedicationData medication, LocalDate date) {
        LocalDate startDate = medication.startDate() == null ? LocalDate.MIN : medication.startDate();
        LocalDate endDate = medication.endDate() == null ? LocalDate.MAX : medication.endDate();
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    private WeeklyReportResponse toStoredResponse(ReportJdbcRepository.WeeklyReportData data) {
        Map<String, Object> metrics = readJsonObject(data.metricsJson());
        List<String> keywords = readJsonStringList(data.topKeywordsJson());
        List<String> recommendations = readJsonStringList(data.recommendationsJson());

        double medicationRate = readMetricAsDouble(metrics, "medicationRate", "medication_rate");
        long activityCount = readMetricAsLong(metrics, "activityCount", "activity_count");

        return new WeeklyReportResponse(
                data.weekStartDate(),
                data.weekEndDate(),
                medicationRate,
                activityCount,
                keywords,
                recommendations,
                data.generatedAt(),
                "STORED"
        );
    }

    private Map<String, Object> readJsonObject(String value) {
        if (value == null || value.isBlank()) {
            return Map.of();
        }
        try {
            JsonNode node = objectMapper.readTree(value);
            if (node.isObject()) {
                return objectMapper.convertValue(node, MAP_TYPE);
            }
            if (node.isTextual()) {
                String nested = node.asText();
                if (nested == null || nested.isBlank()) {
                    return Map.of();
                }
                JsonNode nestedNode = objectMapper.readTree(nested);
                if (nestedNode.isObject()) {
                    return objectMapper.convertValue(nestedNode, MAP_TYPE);
                }
            }
            throw new IllegalStateException("Invalid metrics json");
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Invalid metrics json", ex);
        }
    }

    private List<String> readJsonStringList(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        try {
            JsonNode node = objectMapper.readTree(value);
            if (node.isArray()) {
                return objectMapper.convertValue(node, STRING_LIST_TYPE);
            }
            if (node.isTextual()) {
                String nested = node.asText();
                if (nested == null || nested.isBlank()) {
                    return List.of();
                }
                JsonNode nestedNode = objectMapper.readTree(nested);
                if (nestedNode.isArray()) {
                    return objectMapper.convertValue(nestedNode, STRING_LIST_TYPE);
                }
            }
            throw new IllegalStateException("Invalid json array");
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Invalid json array", ex);
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize report json", ex);
        }
    }

    private double readMetricAsDouble(Map<String, Object> metrics, String... keys) {
        Number value = readMetricAsNumber(metrics, keys);
        return value == null ? 0.0 : value.doubleValue();
    }

    private long readMetricAsLong(Map<String, Object> metrics, String... keys) {
        Number value = readMetricAsNumber(metrics, keys);
        return value == null ? 0L : value.longValue();
    }

    private Number readMetricAsNumber(Map<String, Object> metrics, String... keys) {
        for (String key : keys) {
            Object value = metrics.get(key);
            if (value instanceof Number number) {
                return number;
            }
        }
        return null;
    }

    private LocalDate resolveWeekStart(LocalDate requestedWeekStart) {
        LocalDate baseDate = requestedWeekStart == null ? LocalDate.now() : requestedWeekStart;
        return baseDate.with(DayOfWeek.MONDAY);
    }

    private Elder getOwnedElder(Long elderId) {
        Elder elder = elderRepository.findById(elderId)
                .orElseThrow(() -> new EntityNotFoundException("Elder not found"));
        User user = getCurrentUser();
        if (!elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Report access denied");
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
        if (hasRole(authentication, "ROLE_ROBOT")) {
            throw new AccessDeniedException("Robot principal cannot access user ownership scope");
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

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role::equals);
    }

    private record GeneratedWeeklyReport(
            LocalDate weekStartDate,
            LocalDate weekEndDate,
            double medicationRate,
            long activityCount,
            List<String> conversationKeywords,
            List<String> recommendations,
            LocalDateTime generatedAt
    ) {
        private WeeklyReportResponse toResponse(String source) {
            return new WeeklyReportResponse(
                    weekStartDate,
                    weekEndDate,
                    medicationRate,
                    activityCount,
                    conversationKeywords,
                    recommendations,
                    generatedAt,
                    source
            );
        }
    }
}
