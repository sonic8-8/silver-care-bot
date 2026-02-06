package site.silverbot.api.elder.controller;

import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import site.silverbot.api.common.ApiResponse;
import site.silverbot.api.elder.request.CreateContactRequest;
import site.silverbot.api.elder.request.UpdateContactRequest;
import site.silverbot.api.elder.response.ContactResponse;
import site.silverbot.api.elder.service.EmergencyContactService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/elders/{elderId}/contacts")
public class EmergencyContactController {
    private final EmergencyContactService emergencyContactService;

    @PostMapping
    public ApiResponse<ContactResponse> createContact(
            @PathVariable Long elderId,
            @Valid @RequestBody CreateContactRequest request
    ) {
        return ApiResponse.success(emergencyContactService.createContact(elderId, request));
    }

    @GetMapping
    public ApiResponse<List<ContactResponse>> getContacts(@PathVariable Long elderId) {
        return ApiResponse.success(emergencyContactService.getContacts(elderId));
    }

    @PutMapping("/{contactId}")
    public ApiResponse<ContactResponse> updateContact(
            @PathVariable Long elderId,
            @PathVariable Long contactId,
            @Valid @RequestBody UpdateContactRequest request
    ) {
        return ApiResponse.success(emergencyContactService.updateContact(elderId, contactId, request));
    }

    @DeleteMapping("/{contactId}")
    public ApiResponse<Void> deleteContact(
            @PathVariable Long elderId,
            @PathVariable Long contactId
    ) {
        emergencyContactService.deleteContact(elderId, contactId);
        return ApiResponse.ok();
    }
}
