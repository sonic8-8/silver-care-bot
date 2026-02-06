package site.silverbot.api.elder.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import site.silverbot.domain.elder.ElderStatus;
import site.silverbot.domain.elder.Gender;
import site.silverbot.domain.emergency.EmergencyType;

public record ElderResponse(
        Long id,
        String name,
        int age,
        LocalDate birthDate,
        Gender gender,
        String address,
        ElderStatus status,
        LocalDateTime lastActivity,
        String location,
        Boolean robotConnected,
        EmergencyType emergencyType,
        List<ContactResponse> emergencyContacts
) {
}
