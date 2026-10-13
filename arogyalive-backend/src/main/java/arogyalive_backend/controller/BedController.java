package arogyalive_backend.controller;

import arogyalive_backend.entity.Bed;
import arogyalive_backend.service.BedService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
public class BedController {

    private final BedService bedService;

    public BedController(BedService bedService) {
        this.bedService = bedService;
    }

    @GetMapping("/{hospitalId}/beds")
    public List<Bed> getBedsByHospitalId(@PathVariable Long hospitalId) {
        return bedService.getBedsByHospitalId(hospitalId);
    }
}