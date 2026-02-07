package site.silverbot.api.common.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import site.silverbot.domain.user.User;
import site.silverbot.domain.user.UserRepository;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }
        if (hasRole(authentication, "ROLE_ROBOT")) {
            throw new AccessDeniedException("Robot principal cannot be treated as user principal");
        }

        String principal = authentication.getName();
        if (!StringUtils.hasText(principal)) {
            throw new AuthenticationCredentialsNotFoundException("User principal is empty");
        }

        Long userId = parseLong(principal);
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
        }

        return userRepository.findByEmail(principal)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private Long parseLong(String value) {
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority()));
    }
}
