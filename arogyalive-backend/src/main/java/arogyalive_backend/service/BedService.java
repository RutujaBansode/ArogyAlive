package arogyalive_backend.service;

import arogyalive_backend.entity.Bed;
import arogyalive_backend.repository.BedRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BedService {

    private final BedRepository bedRepository;

    public BedService(BedRepository bedRepository) {
        this.bedRepository = bedRepository;
    }

    public List<Bed> getBedsByHospitalId(Long hospitalId) {
        return bedRepository.findByHospitalId(hospitalId);
    }
}