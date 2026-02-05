package site.silverbot.api.elder.service;

import java.util.List;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import site.silverbot.api.elder.request.CreateContactRequest;
import site.silverbot.api.elder.request.UpdateContactRequest;
import site.silverbot.api.elder.response.ContactResponse;
import site.silverbot.domain.elder.Elder;
import site.silverbot.domain.elder.ElderRepository;
import site.silverbot.domain.elder.EmergencyContact;
import site.silverbot.domain.elder.EmergencyContactRepository;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class EmergencyContactService {
    private final ElderRepository elderRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final UserRepository userRepository;

    public ContactResponse createContact(Long elderId, CreateContactRequest request) {
        Elder elder = getOwnedElder(elderId);
        EmergencyContact contact = EmergencyContact.builder()
                .elder(elder)
                .name(request.name())
                .phone(request.phone())
                .relation(request.relation())
                .priority(request.priority())
                .build();
        EmergencyContact saved = emergencyContactRepository.save(contact);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getContacts(Long elderId) {
        getOwnedElder(elderId);
        return emergencyContactRepository.findAllByElderIdOrderByPriorityAsc(elderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ContactResponse updateContact(Long elderId, Long contactId, UpdateContactRequest request) {
        getOwnedElder(elderId);
        EmergencyContact contact = emergencyContactRepository.findById(contactId)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        if (!contact.getElder().getId().equals(elderId)) {
            throw new AccessDeniedException("Contact access denied");
        }
        contact.updateInfo(request.name(), request.phone(), request.relation(), request.priority());
        return toResponse(contact);
    }

    public void deleteContact(Long elderId, Long contactId) {
        getOwnedElder(elderId);
        EmergencyContact contact = emergencyContactRepository.findById(contactId)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        if (!contact.getElder().getId().equals(elderId)) {
            throw new AccessDeniedException("Contact access denied");
        }
        emergencyContactRepository.delete(contact);
    }

    private ContactResponse toResponse(EmergencyContact contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getName(),
                contact.getPhone(),
                contact.getRelation(),
                contact.getPriority()
        );
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
