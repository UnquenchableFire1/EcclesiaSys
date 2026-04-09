package com.example.controller;

import com.example.dao.AttendanceDAO;
import com.example.dao.VisitorDAO;
import com.example.model.Attendance;
import com.example.model.Visitor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AttendanceController {

    private final AttendanceDAO attendanceDAO = new AttendanceDAO();
    private final VisitorDAO visitorDAO = new VisitorDAO();

    @SuppressWarnings("unchecked") // Cast is safe: JSON deserializer always produces List<Map<String,Object>>
    @PostMapping
    public Map<String, Object> submitAttendance(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Attendance a = new Attendance();
            a.setBranchId((Integer) body.get("branchId"));
            a.setDate(LocalDate.parse((String) body.get("date")));
            a.setMenCount((Integer) body.get("men"));
            a.setWomenCount((Integer) body.get("women"));
            a.setChildrenCount((Integer) body.get("children"));
            a.setEldersCount((Integer) body.get("elders"));
            a.setDeaconsCount((Integer) body.get("deacons"));
            a.setDeaconessesCount((Integer) body.get("deaconesses"));
            a.setTotalOfficers((Integer) body.get("totalOfficers"));
            a.setVisitorsCount((Integer) body.get("visitorsCount"));
            a.setVisitorType((String) body.get("visitorType"));

            int attendanceId = attendanceDAO.addAttendance(a);
            
            // Handle visitors list if present
            List<Map<String, Object>> visitors = (List<Map<String, Object>>) body.get("visitors");
            if (visitors != null) {
                for (Map<String, Object> vMap : visitors) {
                    Visitor v = new Visitor();
                    v.setAttendanceId(attendanceId);
                    v.setName((String) vMap.get("name"));
                    v.setPhoneNumber((String) vMap.get("phoneNumber"));
                    v.setEmail((String) vMap.get("email"));
                    v.setVisitType(a.getVisitorType());
                    v.setFollowUpStatus("PENDING");
                    visitorDAO.addVisitor(v);
                }
            }

            response.put("success", true);
            response.put("message", "Attendance recorded successfully!");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to record attendance: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/branch/{branchId}")
    public Map<String, Object> getBranchAttendance(@PathVariable int branchId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Attendance> reports = attendanceDAO.getAttendanceByBranch(branchId);
            response.put("success", true);
            response.put("data", reports);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/visitors/branch/{branchId}")
    public Map<String, Object> getBranchVisitors(@PathVariable int branchId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Visitor> visitors = visitorDAO.getVisitorsByBranch(branchId);
            response.put("success", true);
            response.put("data", visitors);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/visitors/{visitorId}/followup")
    public Map<String, Object> updateFollowUp(@PathVariable int visitorId, @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String status = body.get("status");
            visitorDAO.updateFollowUpStatus(visitorId, status);
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }
}
