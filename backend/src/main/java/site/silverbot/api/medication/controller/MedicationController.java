package site.silverbot.api.medication.controller;

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
import site.silverbot.api.medication.request.CreateMedicationRecordRequest;
import site.silverbot.api.medication.request.CreateMedicationRequest;
import site.silverbot.api.medication.request.UpdateMedicationRequest;
import site.silverbot.api.medication.response.MedicationListResponse;
import site.silverbot.api.medication.response.MedicationRecordResponse;
import site.silverbot.api.medication.response.MedicationResponse;
import site.silverbot.api.medication.service.MedicationService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/elders/{elderId}/medications")
public class MedicationController {
    private final MedicationService medicationService;

    @PostMapping
    public ApiResponse<MedicationResponse> createMedication(
            @PathVariable Long elderId,
            @Valid @RequestBody CreateMedicationRequest request
    ) {
        return ApiResponse.success(medicationService.createMedication(elderId, request));
    }

    @GetMapping
    public ApiResponse<MedicationListResponse> getMedications(@PathVariable Long elderId) {
        return ApiResponse.success(medicationService.getMedications(elderId));
    }

    @GetMapping("/{medicationId}")
    public ApiResponse<MedicationResponse> getMedication(
            @PathVariable Long elderId,
            @PathVariable Long medicationId
    ) {
        return ApiResponse.success(medicationService.getMedication(elderId, medicationId));
    }

    @PutMapping("/{medicationId}")
    public ApiResponse<MedicationResponse> updateMedication(
            @PathVariable Long elderId,
            @PathVariable Long medicationId,
            @RequestBody UpdateMedicationRequest request
    ) {
        return ApiResponse.success(medicationService.updateMedication(elderId, medicationId, request));
    }

    @DeleteMapping("/{medicationId}")
    public ApiResponse<Void> deleteMedication(
            @PathVariable Long elderId,
            @PathVariable Long medicationId
    ) {
        medicationService.deleteMedication(elderId, medicationId);
        return ApiResponse.ok();
    }

    @PostMapping("/records")
    public ApiResponse<MedicationRecordResponse> createMedicationRecord(
            @PathVariable Long elderId,
            @Valid @RequestBody CreateMedicationRecordRequest request
    ) {
        return ApiResponse.success(medicationService.createMedicationRecord(elderId, request));
    }
}
