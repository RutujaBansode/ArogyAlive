package arogyalive_backend.controller;

import arogyalive_backend.entity.EmergencyRequest;
import arogyalive_backend.service.EmergencyRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/emergency-requests")
public class EmergencyRequestController {

    private final EmergencyRequestService emergencyRequestService;

    public EmergencyRequestController(
            EmergencyRequestService emergencyRequestService) {
        this.emergencyRequestService = emergencyRequestService;
    }

    @PostMapping
    public EmergencyRequest createEmergencyRequest(
            @RequestBody EmergencyRequest emergencyRequest) {

        return emergencyRequestService
                .createEmergencyRequest(emergencyRequest);
    }

    @GetMapping("/patient/{patientId}")
    public List<EmergencyRequest> getRequestsByPatientId(
            @PathVariable Long patientId) {

        return emergencyRequestService
                .getRequestsByPatientId(patientId);
    }

    @GetMapping("/ambulance/{ambulanceId}")
    public List<EmergencyRequest> getRequestsByAmbulanceId(
            @PathVariable Long ambulanceId) {

        return emergencyRequestService
                .getRequestsByAmbulanceId(ambulanceId);
    }

    @GetMapping("/status/{status}")
    public List<EmergencyRequest> getRequestsByStatus(
            @PathVariable String status) {

        return emergencyRequestService
                .getRequestsByStatus(status);
    }

    @PutMapping("/{requestId}/status")
    public ResponseEntity<EmergencyRequest> updateStatus(
            @PathVariable Long requestId,
            @RequestParam String status) {

        return emergencyRequestService
                .updateStatus(requestId, status)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}