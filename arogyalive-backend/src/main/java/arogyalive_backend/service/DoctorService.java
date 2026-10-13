package arogyalive_backend.service;

import arogyalive_backend.entity.Doctor;
import arogyalive_backend.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getDoctorsByHospitalId(Long hospitalId) {
        return doctorRepository.findByHospitalId(hospitalId);
    }
}