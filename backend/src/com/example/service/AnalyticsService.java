package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    @Autowired
    private EntityManager entityManager;

    /**
     * Track page view event
     */
    public void trackPageView(String userId, String pageName, String userAgent) {
        try {
            String sql = "INSERT INTO analytics_events (user_id, event_type, event_data, created_at) " +
                         "VALUES (?1, 'PAGE_VIEW', ?2, ?3)";
            
            String eventData = "page=" + pageName + "&user_agent=" + userAgent;
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, userId != null ? userId : "anonymous");
            query.setParameter(2, eventData);
            query.setParameter(3, LocalDateTime.now());
            query.executeUpdate();
            
            logger.info("Page view tracked: {} by user: {}", pageName, userId);
        } catch (Exception e) {
            logger.error("Failed to track page view", e);
        }
    }

    /**
     * Track resource access (sermon, announcement, event)
     */
    public void trackResourceAccess(String userId, String resourceType, Long resourceId, String resourceName) {
        try {
            String sql = "INSERT INTO analytics_events (user_id, event_type, event_data, created_at) " +
                         "VALUES (?1, 'RESOURCE_ACCESS', ?2, ?3)";
            
            String eventData = "resource_type=" + resourceType + "&resource_id=" + resourceId + "&resource_name=" + resourceName;
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, userId != null ? userId : "anonymous");
            query.setParameter(2, eventData);
            query.setParameter(3, LocalDateTime.now());
            query.executeUpdate();
            
            logger.info("Resource access tracked: {} (ID: {}) - Type: {} by user: {}", resourceName, resourceId, resourceType, userId);
        } catch (Exception e) {
            logger.error("Failed to track resource access", e);
        }
    }

    /**
     * Track user action (download, share, comment)
     */
    public void trackUserAction(String userId, String actionType, String actionDetails) {
        try {
            String sql = "INSERT INTO analytics_events (user_id, event_type, event_data, created_at) " +
                         "VALUES (?1, 'USER_ACTION', ?2, ?3)";
            
            String eventData = "action=" + actionType + "&details=" + actionDetails;
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, userId != null ? userId : "anonymous");
            query.setParameter(2, eventData);
            query.setParameter(3, LocalDateTime.now());
            query.executeUpdate();
            
            logger.info("User action tracked: {} - {} by user: {}", actionType, actionDetails, userId);
        } catch (Exception e) {
            logger.error("Failed to track user action", e);
        }
    }

    /**
     * Track user engagement (time spent, interactions)
     */
    public void trackEngagement(String userId, String engagementType, Long durationSeconds) {
        try {
            String sql = "INSERT INTO analytics_events (user_id, event_type, event_data, created_at) " +
                         "VALUES (?1, 'ENGAGEMENT', ?2, ?3)";
            
            String eventData = "engagement_type=" + engagementType + "&duration_seconds=" + durationSeconds;
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, userId != null ? userId : "anonymous");
            query.setParameter(2, eventData);
            query.setParameter(3, LocalDateTime.now());
            query.executeUpdate();
            
            logger.info("Engagement tracked: {} ({} seconds) by user: {}", engagementType, durationSeconds, userId);
        } catch (Exception e) {
            logger.error("Failed to track engagement", e);
        }
    }

    /**
     * Get analytics summary
     */
    public Map<String, Object> getAnalyticsSummary(String startDate, String endDate) {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            // Total page views
            String pageViewSql = "SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'PAGE_VIEW' " +
                                "AND created_at BETWEEN ?1 AND ?2";
            Query pageViewQuery = entityManager.createNativeQuery(pageViewSql);
            pageViewQuery.setParameter(1, startDate);
            pageViewQuery.setParameter(2, endDate);
            summary.put("page_views", pageViewQuery.getFirstResult());

            // Resource access count
            String resourceSql = "SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'RESOURCE_ACCESS' " +
                                "AND created_at BETWEEN ?1 AND ?2";
            Query resourceQuery = entityManager.createNativeQuery(resourceSql);
            resourceQuery.setParameter(1, startDate);
            resourceQuery.setParameter(2, endDate);
            summary.put("resource_accesses", resourceQuery.getFirstResult());

            // User actions count
            String actionSql = "SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'USER_ACTION' " +
                              "AND created_at BETWEEN ?1 AND ?2";
            Query actionQuery = entityManager.createNativeQuery(actionSql);
            actionQuery.setParameter(1, startDate);
            actionQuery.setParameter(2, endDate);
            summary.put("user_actions", actionQuery.getFirstResult());

            // Active users
            String activeSql = "SELECT COUNT(DISTINCT user_id) as count FROM analytics_events " +
                              "WHERE created_at BETWEEN ?1 AND ?2";
            Query activeQuery = entityManager.createNativeQuery(activeSql);
            activeQuery.setParameter(1, startDate);
            activeQuery.setParameter(2, endDate);
            summary.put("active_users", activeQuery.getFirstResult());

            logger.info("Analytics summary retrieved for period: {} to {}", startDate, endDate);
        } catch (Exception e) {
            logger.error("Failed to retrieve analytics summary", e);
        }

        return summary;
    }

    /**
     * Get most accessed resources
     */
    public List<?> getMostAccessedResources(int limit) {
        try {
            String sql = "SELECT event_data, COUNT(*) as access_count FROM analytics_events " +
                        "WHERE event_type = 'RESOURCE_ACCESS' " +
                        "GROUP BY event_data ORDER BY access_count DESC LIMIT ?1";
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, limit);
            
            logger.info("Retrieved top {} most accessed resources", limit);
            return query.getResultList();
        } catch (Exception e) {
            logger.error("Failed to get most accessed resources", e);
            return List.of();
        }
    }

    /**
     * Get user engagement metrics
     */
    public Map<String, Object> getUserEngagementMetrics(String userId) {
        Map<String, Object> metrics = new HashMap<>();
        
        try {
            // Total events for user
            String eventSql = "SELECT COUNT(*) as count FROM analytics_events WHERE user_id = ?1";
            Query eventQuery = entityManager.createNativeQuery(eventSql);
            eventQuery.setParameter(1, userId);
            metrics.put("total_events", eventQuery.getFirstResult());

            // Last activity
            String lastActivitySql = "SELECT created_at FROM analytics_events WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 1";
            Query lastActivityQuery = entityManager.createNativeQuery(lastActivitySql);
            lastActivityQuery.setParameter(1, userId);
            metrics.put("last_activity", lastActivityQuery.getFirstResult());

            logger.info("User engagement metrics retrieved for user: {}", userId);
        } catch (Exception e) {
            logger.error("Failed to get user engagement metrics for user: {}", userId, e);
        }

        return metrics;
    }
}
