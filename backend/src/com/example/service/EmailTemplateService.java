package com.example.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.json.JSONObject;
import org.json.JSONArray;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailTemplateService {

    private static final Logger logger = LoggerFactory.getLogger(EmailTemplateService.class);

    @Autowired
    private EmailService emailService;

    /**
     * Welcome email for new member registration
     */
    public void sendWelcomeEmail(String recipientEmail, String userName, String churchName) {
        try {
            String subject = "Welcome to " + churchName + " - Let's Get Started!";
            String htmlContent = "<html><body>" +
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background-color: #0F766E; color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;'>" +
                "<h1 style='margin: 0;'>Welcome to " + churchName + "!</h1>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px;'>" +
                "<p>Dear <strong>" + userName + "</strong>,</p>" +
                "<p>We are thrilled to have you join our community of faith! Your membership opens doors to a world of spiritual growth, meaningful connections, and purpose-driven living.</p>" +
                "<h3 style='color: #0F766E;'>What's Next?</h3>" +
                "<ul>" +
                "<li><strong>Explore Resources:</strong> Browse our sermons, announcements, and upcoming events</li>" +
                "<li><strong>Attend Services:</strong> Join us for Sunday worship at 10:00 AM and Wednesday Bible study at 7:00 PM</li>" +
                "<li><strong>Connect:</strong> Join our community groups and ministries</li>" +
                "<li><strong>Serve:</strong> Discover volunteer opportunities aligned with your gifts</li>" +
                "</ul>" +
                "<p>If you have any questions or need assistance, don't hesitate to reach out to our team.</p>" +
                "<p style='margin-top: 30px;'>In Christ,<br/><strong>" + churchName + " Team</strong></p>" +
                "</div></div></body></html>";

            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            logger.error("Failed to send welcome email to: {}", recipientEmail, e);
        }
    }

    /**
     * Event notification email
     */
    public void sendEventNotificationEmail(String recipientEmail, String eventName, 
                                           String eventDate, String eventDescription, String eventLocation, String eventId) {
        try {
            String eventLink = "https://ecclesiasys-bequ.onrender.com/events?id=" + eventId;
            String subject = "Upcoming Event: " + eventName;
            String htmlContent = "<html><body>" +
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background-color: #0F4C5C; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'>" +
                "<h1 style='margin: 0;'>📅 " + eventName + "</h1>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'>" +
                "<p>You're invited to an upcoming event!</p>" +
                "<div style='background-color: white; padding: 20px; border-left: 4px solid #FDE047; margin: 20px 0;'>" +
                "<p><strong>Event:</strong> " + eventName + "</p>" +
                "<p><strong>Date & Time:</strong> " + eventDate + "</p>" +
                "<p><strong>Location:</strong> " + eventLocation + "</p>" +
                "</div>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + eventLink + "' style='background-color: #0F766E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;'>View Event Details</a>" +
                "</div>" +
                "<p>Mark your calendar and join us for a wonderful time of fellowship and ministry!</p>" +
                "<p style='margin-top: 30px; color: #666;'><small>This is an automated notification from EcclesiaSys.</small></p>" +
                "</div></div></body></html>";

            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            logger.error("Failed to send event notification", e);
        }
    }

    /**
     * Announcement notification email
     */
    public void sendAnnouncementNotificationEmail(String recipientEmail, String announcementTitle, String announcementContent, String announcementId) {
        try {
            String announcementLink = "https://ecclesiasys-bequ.onrender.com/announcements?id=" + announcementId;
            String subject = "Church Announcement: " + announcementTitle;
            String htmlContent = "<html><body>" +
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background-color: #0F766E; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'>" +
                "<h1 style='margin: 0;'>📢 " + announcementTitle + "</h1>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'>" +
                "<p>Hello,</p>" +
                "<p>" + announcementContent + "</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + announcementLink + "' style='background-color: #0F4C5C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;'>Read Full Announcement</a>" +
                "</div>" +
                "<p style='margin-top: 30px; color: #666;'><small>This is an automated notification from EcclesiaSys.</small></p>" +
                "</div></div></body></html>";

            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            logger.error("Failed to send announcement notification", e);
        }
    }

    /**
     * Sermon notification email
     */
    public void sendSermonNotificationEmail(String recipientEmail, String sermonTitle, String speaker, String description, String sermonId) {
        try {
            String sermonLink = "https://ecclesiasys-bequ.onrender.com/sermons?id=" + sermonId;
            String subject = "New Sermon Posted: " + sermonTitle;
            String htmlContent = "<html><body>" +
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background-color: #0F4C5C; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'>" +
                "<h1 style='margin: 0;'>🎙️ New Sermon: " + sermonTitle + "</h1>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'>" +
                "<p>A new sermon has been uploaded to the platform.</p>" +
                "<div style='background-color: white; padding: 20px; border-left: 4px solid #0F766E; margin: 20px 0;'>" +
                "<p><strong>Title:</strong> " + sermonTitle + "</p>" +
                "<p><strong>Speaker:</strong> " + speaker + "</p>" +
                "<p><strong>Description:</strong> " + (description != null ? description : "New message available to watch or listen.") + "</p>" +
                "</div>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + sermonLink + "' style='background-color: #0F766E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;'>Listen / Watch Now</a>" +
                "</div>" +
                "<p style='margin-top: 30px; color: #666;'><small>This is an automated notification from EcclesiaSys.</small></p>" +
                "</div></div></body></html>";

            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            logger.error("Failed to send sermon notification", e);
        }
    }


    /**
     * Weekly digest/newsletter email
     */
    public void sendWeeklyDigestEmail(String recipientEmail, String userName, String highlightedEvents, String featuredSermon) {
        try {
            String subject = "Weekly Digest - " + getCurrentWeekLabel();
            String htmlContent = "<html><body>" +
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background-color: #0F766E; color: white; padding: 20px; text-align: center;'>" +
                "<h2 style='margin: 0;'>Weekly Digest</h2>" +
                "<p style='margin: 10px 0 0 0; font-size: 12px;'>" + getCurrentWeekLabel() + "</p>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 30px;'>" +
                "<p>Hi " + userName + ",</p>" +
                "<p>Here's what's happening this week at our church:</p>" +
                "<h3 style='color: #0F766E;'>This Week's Highlights</h3>" +
                "<div style='background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;'>" +
                highlightedEvents +
                "</div>" +
                "<h3 style='color: #0F766E;'>Featured Sermon</h3>" +
                "<div style='background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;'>" +
                featuredSermon +
                "</div>" +
                "<p>Stay connected. Be inspired. Make a difference.</p>" +
                "<p style='margin-top: 30px; color: #666;'><small>This is an automated digest from our church management system. You can manage your subscription preferences in your account settings.</small></p>" +
                "</div></div></body></html>";

            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            logger.error("Failed to send weekly digest email to: {}", recipientEmail, e);
        }
    }

    /**
     * Birthday/Anniversary greeting email
     */
    public void sendBirthdayGreetingEmail(String recipientEmail, String userName, String churchName) {
        try {
            String subject = "Happy Birthday! " + userName;
            String htmlContent = "<html><body>" +
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background-color: #FDE047; color: #0F766E; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;'>" +
                "<h1 style='margin: 0;'>🎂 Happy Birthday, " + userName + "!</h1>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px; text-align: center;'>" +
                "<p style='font-size: 18px; margin: 20px 0;'>Today is a special day, and we want you to know how much you mean to our " + churchName + " community!</p>" +
                "<p>Wishing you a wonderful year filled with blessings, joy, and spiritual growth.</p>" +
                "<p style='font-size: 14px; margin-top: 30px; color: #666;'>May God's love and grace continue to guide you every day.</p>" +
                "</div></div></body></html>";

            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            logger.error("Failed to send birthday greeting email to: {}", recipientEmail, e);
        }
    }

    /**
     * Volunteer opportunity email
     */
    public void sendVolunteerOpportunityEmail(String recipientEmail, String opportunityTitle, 
                                             String opportunityDescription, String requiredSkills, String contactEmail) {
        try {
            String subject = "Volunteer Opportunity: " + opportunityTitle;
            String htmlContent = "<html><body>" +
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background-color: #0F766E; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'>" +
                "<h1 style='margin: 0;'>🤝 " + opportunityTitle + "</h1>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'>" +
                "<p>Hello,</p>" +
                "<p>We have an exciting volunteer opportunity that might be perfect for you!</p>" +
                "<div style='background-color: white; padding: 20px; border-left: 4px solid #0F766E; margin: 20px 0;'>" +
                "<p><strong>Opportunity:</strong> " + opportunityTitle + "</p>" +
                "<p><strong>Description:</strong> " + opportunityDescription + "</p>" +
                "<p><strong>Required Skills:</strong> " + requiredSkills + "</p>" +
                "</div>" +
                "<p>If you're interested in serving our community and using your gifts, please reach out to us at <a href='mailto:" + contactEmail + "'>" + contactEmail + "</a></p>" +
                "<p>We look forward to hearing from you!</p>" +
                "<p style='margin-top: 30px; color: #666;'><small>This is an automated notification from our church management system.</small></p>" +
                "</div></div></body></html>";

            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            logger.error("Failed to send volunteer opportunity email to: {}", recipientEmail, e);
        }
    }

    /**
     * Password reset email
     */
    public void sendPasswordResetEmail(String recipientEmail, String userName, String resetCode) {
        try {
            String subject = "Password Reset Request - EcclesiaSys";
            String htmlContent = "<html><body>" +
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background-color: #0F766E; color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;'>" +
                "<h1 style='margin: 0;'>Password Reset</h1>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px;'>" +
                "<p>Dear <strong>" + userName + "</strong>,</p>" +
                "<p>We received a request to reset your password for your EcclesiaSys account. Use the code below to complete the process:</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<div style='background-color: white; border: 2px dashed #0F766E; padding: 20px; display: inline-block; border-radius: 12px;'>" +
                "<h2 style='margin: 0; color: #0F766E; letter-spacing: 5px; font-size: 32px;'>" + resetCode + "</h2>" +
                "</div>" +
                "</div>" +
                "<p>This code will expire in 15 minutes. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>" +
                "<p style='margin-top: 30px;'>In Christ,<br/><strong>EcclesiaSys Team</strong></p>" +
                "<p style='margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #ddd; pt-4;'>" +
                "This is an automated security notification. Do not share this code with anyone." +
                "</p>" +
                "</div></div></body></html>";

            emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {}", recipientEmail, e);
        }
    }

    private String getCurrentWeekLabel() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        return "Week of " + now.format(formatter);
    }
}
