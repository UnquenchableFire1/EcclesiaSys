/**
 * Frontend Analytics Tracking Service
 * Handles client-side event tracking and analytics reporting
 */

class AnalyticsTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.pageLoadTime = performance.now();
    this.lastInteractionTime = Date.now();
    this.engagementTime = 0;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track page view
   */
  trackPageView(pageName) {
    const userId = localStorage.getItem('userId');
    const userAgent = navigator.userAgent;
    
    const event = {
      type: 'PAGE_VIEW',
      pageName,
      userId: userId || 'anonymous',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent
    };

    this.sendAnalytics(event);
    console.log('📊 Analytics - Page View:', pageName);
  }

  /**
   * Track resource access (sermon, announcement, event, etc.)
   */
  trackResourceAccess(resourceType, resourceId, resourceName) {
    const userId = localStorage.getItem('userId');
    
    const event = {
      type: 'RESOURCE_ACCESS',
      resourceType,
      resourceId,
      resourceName,
      userId: userId || 'anonymous',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.sendAnalytics(event);
    console.log(`📊 Analytics - Resource Access: ${resourceType} - ${resourceName}`);
  }

  /**
   * Track user actions (download, share, stream, etc.)
   */
  trackUserAction(actionType, actionDetails = {}) {
    const userId = localStorage.getItem('userId');
    
    const event = {
      type: 'USER_ACTION',
      actionType,
      actionDetails,
      userId: userId || 'anonymous',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.sendAnalytics(event);
    console.log(`📊 Analytics - Action: ${actionType}`, actionDetails);
  }

  /**
   * Track audio/video engagement
   */
  trackMediaEngagement(mediaType, mediaId, mediaName, duration) {
    const userId = localStorage.getItem('userId');
    
    const event = {
      type: 'MEDIA_ENGAGEMENT',
      mediaType, // 'AUDIO', 'VIDEO'
      mediaId,
      mediaName,
      durationSeconds: Math.round(duration),
      userId: userId || 'anonymous',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.sendAnalytics(event);
    console.log(`📊 Analytics - Media: ${mediaType} - ${mediaName} (${Math.round(duration)}s)`);
  }

  /**
   * Track user engagement time on page
   */
  trackEngagementTime() {
    const userId = localStorage.getItem('userId');
    const currentTime = Date.now();
    const timeSpent = Math.round((currentTime - this.lastInteractionTime) / 1000); // in seconds
    
    if (timeSpent > 1) {
      const event = {
        type: 'ENGAGEMENT',
        durationSeconds: timeSpent,
        userId: userId || 'anonymous',
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      };

      this.sendAnalytics(event);
      console.log(`📊 Analytics - Engagement: ${timeSpent} seconds`);
    }

    this.lastInteractionTime = currentTime;
  }

  /**
   * Track form submissions
   */
  trackFormSubmission(formName, formData = {}) {
    const userId = localStorage.getItem('userId');
    
    const event = {
      type: 'FORM_SUBMISSION',
      formName,
      formFields: Object.keys(formData),
      userId: userId || 'anonymous',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.sendAnalytics(event);
    console.log(`📊 Analytics - Form Submitted: ${formName}`);
  }

  /**
   * Track errors
   */
  trackError(errorMessage, errorType = 'GENERAL') {
    const userId = localStorage.getItem('userId');
    
    const event = {
      type: 'ERROR',
      errorType,
      errorMessage,
      userId: userId || 'anonymous',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    this.sendAnalytics(event);
    console.error(`📊 Analytics - Error: ${errorMessage}`);
  }

  /**
   * Send analytics event to backend
   */
  sendAnalytics(event) {
    try {
      // Send to backend analytics endpoint
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }).catch(err => {
        console.warn('Failed to send analytics:', err);
      });

      // Also send to Google Analytics if available
      if (window.gtag) {
        window.gtag('event', event.type, {
          event_category: event.type,
          event_label: event.pageName || event.actionType || event.resourceType,
          value: event.durationSeconds || 1
        });
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Track session start
   */
  trackSessionStart() {
    const userId = localStorage.getItem('userId');
    const event = {
      type: 'SESSION_START',
      userId: userId || 'anonymous',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      browser: navigator.userAgent
    };

    this.sendAnalytics(event);
    console.log(`📊 Analytics - Session Started: ${this.sessionId}`);
  }

  /**
   * Track session end
   */
  trackSessionEnd() {
    const userId = localStorage.getItem('userId');
    const sessionDuration = Math.round((Date.now() - this.lastInteractionTime) / 1000);
    
    const event = {
      type: 'SESSION_END',
      userId: userId || 'anonymous',
      sessionId: this.sessionId,
      sessionDurationSeconds: sessionDuration,
      timestamp: new Date().toISOString()
    };

    this.sendAnalytics(event);
    console.log(`📊 Analytics - Session Ended: ${this.sessionId} (Duration: ${sessionDuration}s)`);
  }
}

// Create global analytics instance
const analytics = new AnalyticsTracker();

// Track session start on page load
window.addEventListener('load', () => {
  analytics.trackSessionStart();
});

// Track engagement periodically
setInterval(() => {
  analytics.trackEngagementTime();
}, 60000); // Every 60 seconds

// Track session end on page unload
window.addEventListener('beforeunload', () => {
  analytics.trackSessionEnd();
});

// Track errors globally
window.addEventListener('error', (event) => {
  analytics.trackError(event.message, 'JAVASCRIPT_ERROR');
});

export default analytics;
