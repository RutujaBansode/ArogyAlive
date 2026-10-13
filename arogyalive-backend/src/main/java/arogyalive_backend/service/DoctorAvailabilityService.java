package arogyalive_backend.service;

import arogyalive_backend.entity.DoctorAvailability;
import arogyalive_backend.repository.DoctorAvailabilityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;

    public DoctorAvailabilityService(
            DoctorAvailabilityRepository doctorAvailabilityRepository) {
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
    }

    public List<DoctorAvailability> getAvailabilityByDoctorId(Long doctorId) {
        return doctorAvailabilityRepository.findByDoctorId(doctorId);
    }
}