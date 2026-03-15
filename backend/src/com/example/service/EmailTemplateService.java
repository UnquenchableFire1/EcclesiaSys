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

    @Value("${brevo.api-key:null}")
    private String apiKey;
    
    @Value("${brevo.sender-email:onboarding@resend.dev}")
    private String senderEmail;

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

            sendHtmlEmailViaBrevo(recipientEmail, subject, htmlContent);
            logger.info("Welcome email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send welcome email to: {}", recipientEmail, e);
        }
    }

    /**
     * Event notification email
     */
    public void sendEventNotificationEmail(String recipientEmail, String eventName, 
                                          String eventDate, String eventDescription, String eventLocation) {
        try {
            String subject = "Upcoming Event: " + eventName;
            String htmlContent = "<html><body>" +
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background-color: #FDE047; color: #0F766E; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'>" +
                "<h1 style='margin: 0;'>📅 " + eventName + "</h1>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'>" +
                "<p>You're invited to an upcoming event!</p>" +
                "<div style='background-color: white; padding: 20px; border-left: 4px solid #FDE047; margin: 20px 0;'>" +
                "<p><strong>Event:</strong> " + eventName + "</p>" +
                "<p><strong>Date & Time:</strong> " + eventDate + "</p>" +
                "<p><strong>Location:</strong> " + eventLocation + "</p>" +
                "<p><strong>Details:</strong> " + eventDescription + "</p>" +
                "</div>" +
                "<p>Mark your calendar and join us for a wonderful time of fellowship and ministry!</p>" +
                "<p style='margin-top: 30px; color: #666;'><small>This is an automated notification from our church management system.</small></p>" +
                "</div></div></body></html>";

            sendHtmlEmailViaBrevo(recipientEmail, subject, htmlContent);
            logger.info("Event notification email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send event notification email to: {}", recipientEmail, e);
        }
    }

    /**
     * Announcement notification email
     */
    public void sendAnnouncementNotificationEmail(String recipientEmail, String announcementTitle, String announcementContent) {
        try {
            String subject = "Church Announcement: " + announcementTitle;
            String htmlContent = "<html><body>" +
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background-color: #0F766E; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'>" +
                "<h1 style='margin: 0;'>📢 " + announcementTitle + "</h1>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'>" +
                "<p>Hello,</p>" +
                "<p>" + announcementContent + "</p>" +
                "<p>For more information, please log in to your account or contact our office.</p>" +
                "<p style='margin-top: 30px; color: #666;'><small>This is an automated notification from our church management system.</small></p>" +
                "</div></div></body></html>";

            sendHtmlEmailViaBrevo(recipientEmail, subject, htmlContent);
            logger.info("Announcement notification email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send announcement notification email to: {}", recipientEmail, e);
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

            sendHtmlEmailViaBrevo(recipientEmail, subject, htmlContent);
            logger.info("Weekly digest email sent successfully to: {}", recipientEmail);
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

            sendHtmlEmailViaBrevo(recipientEmail, subject, htmlContent);
            logger.info("Birthday greeting email sent successfully to: {}", recipientEmail);
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

            sendHtmlEmailViaBrevo(recipientEmail, subject, htmlContent);
            logger.info("Volunteer opportunity email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send volunteer opportunity email to: {}", recipientEmail, e);
        }
    }

    private void sendHtmlEmailViaBrevo(String to, String subject, String htmlText) throws Exception {
        if ("null".equals(apiKey) || apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("Brevo API key is not configured. Email to {} was not sent.", to);
            return;
        }

        JSONObject payload = new JSONObject();
        
        JSONObject sender = new JSONObject();
        sender.put("name", "EcclesiaSys");
        sender.put("email", senderEmail);
        payload.put("sender", sender);
        
        JSONArray toArray = new JSONArray();
        JSONObject toObj = new JSONObject();
        toObj.put("email", to);
        toArray.put(toObj);
        payload.put("to", toArray);
        
        payload.put("subject", subject);
        payload.put("htmlContent", htmlText);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("api-key", apiKey)
                .header("accept", "application/json")
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new Exception("Brevo API failed with status " + response.statusCode() + " and body: " + response.body());
        }
    }

    private String getCurrentWeekLabel() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        return "Week of " + now.format(formatter);
    }
}
