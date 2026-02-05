package site.silverbot.api.elder.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import site.silverbot.api.elder.request.CreateContactRequest;
import site.silverbot.api.elder.request.CreateElderRequest;
import site.silverbot.api.elder.request.UpdateElderRequest;
import site.silverbot.api.elder.response.ContactResponse;
import site.silverbot.api.elder.response.ElderListResponse;
import site.silverbot.api.elder.response.ElderResponse;
import site.silverbot.api.elder.response.ElderSummaryResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.EmergencyContact;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.emergency.Emergency;
import site.silverbot.domain.emergency.EmergencyRepository;
import site.silverbot.domain.emergency.EmergencyResolution;
import site.silverbot.domain.emergency.EmergencyType;
import site.silverbot.domain.robot.NetworkStatus;
import site.silverbot.domain.robot.RobotRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ElderService {
    private final ElderRepository elderRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final EmergencyRepository emergencyRepository;
    private final RobotRepository robotRepository;
    private final UserRepository userRepository;

    public ElderResponse createElder(CreateElderRequest request) {
        User user = getCurrentUser();
        Elder elder = Elder.builder()
                .user(user)
                .name(request.name())
                .birthDate(request.birthDate())
                .gender(request.gender())
                .address(request.address())
                .build();

        Elder saved = elderRepository.save(elder);
        List<ContactResponse> contacts = saveContacts(saved, request.emergencyContacts());
        return toElderResponse(saved, contacts);
    }

    @Transactional(readOnly = true)
    public ElderListResponse getElders() {
        User user = getCurrentUser();
        List<Elder> elders = elderRepository.findAllByUserId(user.getId());
        if (elders.isEmpty()) {
            return new ElderListResponse(
                    List.of(),
                    new ElderListResponse.ElderSummary(0, 0, 0, 0)
            );
        }
        List<Long> elderIds = elders.stream()
                .map(Elder::getId)
                .toList();
        Map<Long, Boolean> robotConnectedMap = robotRepository.findAllByElderIdIn(elderIds)
                .stream()
                .collect(Collectors.toMap(
                        robot -> robot.getElder().getId(),
                        robot -> robot.getNetworkStatus() == NetworkStatus.CONNECTED,
                        (existing, replacement) -> existing || replacement
                ));
        Map<Long, EmergencyType> pendingEmergencyMap = new HashMap<>();
        List<Emergency> pendingEmergencies = emergencyRepository
                .findAllByElderIdInAndResolutionOrderByDetectedAtDesc(elderIds, EmergencyResolution.PENDING);
        for (Emergency emergency : pendingEmergencies) {
            pendingEmergencyMap.putIfAbsent(emergency.getElder().getId(), emergency.getType());
        }
        List<ElderSummaryResponse> summaries = elders.stream()
                .map(elder -> toSummaryResponse(
                        elder,
                        robotConnectedMap.get(elder.getId()),
                        pendingEmergencyMap.get(elder.getId())
                ))
                .toList();

        int safe = (int) elders.stream().filter(elder -> elder.getStatus() == ElderStatus.SAFE).count();
        int warning = (int) elders.stream().filter(elder -> elder.getStatus() == ElderStatus.WARNING).count();
        int danger = (int) elders.stream().filter(elder -> elder.getStatus() == ElderStatus.DANGER).count();

        return new ElderListResponse(
                summaries,
                new ElderListResponse.ElderSummary(elders.size(), safe, warning, danger)
        );
    }

    @Transactional(readOnly = true)
    public ElderResponse getElder(Long elderId) {
        Elder elder = getOwnedElder(elderId);
        List<ContactResponse> contacts = emergencyContactRepository.findAllByElderIdOrderByPriorityAsc(elderId)
                .stream()
                .map(this::toContactResponse)
                .toList();
        return toElderResponse(elder, contacts);
    }

    public ElderResponse updateElder(Long elderId, UpdateElderRequest request) {
        Elder elder = getOwnedElder(elderId);
        elder.updateInfo(request.name(), request.birthDate(), request.gender(), request.address());
        List<ContactResponse> contacts = emergencyContactRepository.findAllByElderIdOrderByPriorityAsc(elderId)
                .stream()
                .map(this::toContactResponse)
                .toList();
        return toElderResponse(elder, contacts);
    }

    public void deleteElder(Long elderId) {
        Elder elder = getOwnedElder(elderId);
        if (robotRepository.findByElderId(elderId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Elder has assigned robot");
        }
        emergencyContactRepository.deleteAll(emergencyContactRepository.findAllByElderIdOrderByPriorityAsc(elderId));
        emergencyRepository.deleteAll(emergencyRepository.findAllByElderId(elderId));
        elderRepository.delete(elder);
    }

    private List<ContactResponse> saveContacts(Elder elder, List<CreateContactRequest> contacts) {
        if (contacts == null || contacts.isEmpty()) {
            return Collections.emptyList();
        }
        List<EmergencyContact> saved = emergencyContactRepository.saveAll(
                contacts.stream()
                        .filter(Objects::nonNull)
                        .map(contact -> EmergencyContact.builder()
                                .elder(elder)
                                .name(contact.name())
                                .phone(contact.phone())
                                .relation(contact.relation())
                                .priority(contact.priority())
                                .build())
                        .toList()
        );
        return saved.stream().map(this::toContactResponse).toList();
    }

    private ContactResponse toContactResponse(EmergencyContact contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getName(),
                contact.getPhone(),
                contact.getRelation(),
                contact.getPriority()
        );
    }

    private ElderSummaryResponse toSummaryResponse(
            Elder elder,
            Boolean robotConnected,
            EmergencyType pendingEmergencyType
    ) {
        return new ElderSummaryResponse(
                elder.getId(),
                elder.getName(),
                calculateAge(elder.getBirthDate()),
                elder.getStatus(),
                resolveLastActivity(elder),
                elder.getLastLocation(),
                robotConnected,
                pendingEmergencyType
        );
    }

    private ElderResponse toElderResponse(Elder elder, List<ContactResponse> contacts) {
        return new ElderResponse(
                elder.getId(),
                elder.getName(),
                calculateAge(elder.getBirthDate()),
                elder.getBirthDate(),
                elder.getGender(),
                elder.getAddress(),
                elder.getStatus(),
                resolveLastActivity(elder),
                elder.getLastLocation(),
                isRobotConnected(elder.getId()),
                getPendingEmergencyType(elder.getId()),
                contacts
        );
    }

    private int calculateAge(LocalDate birthDate) {
        if (birthDate == null) {
            return 0;
        }
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    private LocalDateTime resolveLastActivity(Elder elder) {
        if (elder.getLastActivityAt() != null) {
            return elder.getLastActivityAt();
        }
        if (elder.getUpdatedAt() != null) {
            return elder.getUpdatedAt();
        }
        return elder.getCreatedAt();
    }

    private Boolean isRobotConnected(Long elderId) {
        return robotRepository.findByElderId(elderId)
                .map(robot -> robot.getNetworkStatus() == NetworkStatus.CONNECTED)
                .orElse(null);
    }

    private EmergencyType getPendingEmergencyType(Long elderId) {
        return emergencyRepository
                .findTopByElderIdAndResolutionOrderByDetectedAtDesc(elderId, EmergencyResolution.PENDING)
                .map(Emergency::getType)
                .orElse(null);
    }

    private Elder getOwnedElder(Long elderId) {
        User user = getCurrentUser();
        Elder elder = elderRepository.findById(elderId)
                .orElseThrow(() -> new EntityNotFoundException("Elder not found"));
        if (!elder.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Elder access denied");
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
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
