package arogyalive_backend.service;

import arogyalive_backend.entity.EmergencyRequest;
import arogyalive_backend.repository.EmergencyRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmergencyRequestService {

    private final EmergencyRequestRepository emergencyRequestRepository;

    public EmergencyRequestService(
            EmergencyRequestRepository emergencyRequestRepository) {
        this.emergencyRequestRepository = emergencyRequestRepository;
    }

    // Create a new emergency request
    public EmergencyRequest createEmergencyRequest(
            EmergencyRequest emergencyRequest) {

        if (emergencyRequest.getStatus() == null
                || emergencyRequest.getStatus().isBlank()) {

            emergencyRequest.setStatus("REQUESTED");
        }

        return emergencyRequestRepository.save(emergencyRequest);
    }

    // Get emergency requests of a patient
    public List<EmergencyRequest> getRequestsByPatientId(
            Long patientId) {

        return emergencyRequestRepository
                .findByPatientId(patientId);
    }

    // Get requests assigned to an ambulance
    public List<EmergencyRequest> getRequestsByAmbulanceId(
            Long ambulanceId) {

        return emergencyRequestRepository
                .findByAmbulanceId(ambulanceId);
    }

    // Get requests by status
    public List<EmergencyRequest> getRequestsByStatus(
            String status) {

        return emergencyRequestRepository
                .findByStatus(status);
    }

    // Update the status of an emergency request
    public Optional<EmergencyRequest> updateStatus(
            Long requestId,
            String status) {

        return emergencyRequestRepository.findById(requestId)
                .map(request -> {
                    request.setStatus(status);
                    return emergencyRequestRepository.save(request);
                });
    }
}