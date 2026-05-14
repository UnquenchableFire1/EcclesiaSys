package com.example.service;

import com.example.dao.MemberDAO;
import com.example.model.Member;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CelebrationService {

    @Autowired
    private EmailTemplateService emailTemplateService;

    private static final String CHURCH_NAME = "COP Ayikai Doblo";

    /**
     * Runs every day at 8:00 AM to process birthdays and anniversaries.
     */
    @Scheduled(cron = "0 0 8 * * ?")
    public void processDailyCelebrations() {
        System.out.println("========== [CELEBRATION SERVICE] ==========");
        System.out.println("Running daily celebration tracker...");

        try {
            MemberDAO dao = new MemberDAO();
            List<Member> allMembers = dao.getAllMembers(null);
            
            LocalDate today = LocalDate.now();
            String todayMonthDay = today.format(DateTimeFormatter.ofPattern("MM-dd"));
            
            // 1. Process Birthdays
            List<Member> birthdays = allMembers.stream()
                .filter(m -> {
                    if (m.getDateOfBirth() == null || m.getDateOfBirth().isEmpty()) return false;
                    try {
                        return m.getDateOfBirth().substring(5).equals(todayMonthDay);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());

            for (Member m : birthdays) {
                if (m.getEmail() != null && !m.getEmail().isEmpty()) {
                    System.out.println(">> Sending Birthday blessing to: " + m.getFirstName() + " (" + m.getEmail() + ")");
                    emailTemplateService.sendBirthdayGreetingEmail(m.getEmail(), m.getFirstName(), CHURCH_NAME);
                }
            }

            // 2. Process Anniversaries
            List<Member> anniversaries = allMembers.stream()
                .filter(m -> {
                    if (m.getJoinedDate() == null) return false;
                    String joinedMonthDay = m.getJoinedDate().toLocalDate().format(DateTimeFormatter.ofPattern("MM-dd"));
                    if (m.getJoinedDate().getYear() == today.getYear()) return false;
                    return joinedMonthDay.equals(todayMonthDay);
                })
                .collect(Collectors.toList());

            for (Member m : anniversaries) {
                if (m.getEmail() != null && !m.getEmail().isEmpty()) {
                    int years = today.getYear() - m.getJoinedDate().getYear();
                    System.out.println(">> Sending Anniversary blessing to: " + m.getFirstName() + " (" + years + " years)");
                    emailTemplateService.sendAnniversaryGreetingEmail(m.getEmail(), m.getFirstName(), years, CHURCH_NAME);
                }
            }

            System.out.println("Found " + birthdays.size() + " birthdays today.");
            System.out.println("Found " + anniversaries.size() + " church anniversaries today.");
            System.out.println("===========================================");
        } catch (Exception e) {
            System.err.println("Failed to process celebrations: " + e.getMessage());
        }
    }
}
