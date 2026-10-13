package arogyalive_backend.service;

import arogyalive_backend.entity.DoctorLanguage;
import arogyalive_backend.repository.DoctorLanguageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorLanguageService {

    private final DoctorLanguageRepository doctorLanguageRepository;

    public DoctorLanguageService(DoctorLanguageRepository doctorLanguageRepository) {
        this.doctorLanguageRepository = doctorLanguageRepository;
    }

    public List<DoctorLanguage> getLanguagesByDoctorId(Long doctorId) {
        return doctorLanguageRepository.findByDoctorId(doctorId);
    }
}