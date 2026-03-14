# Performance Optimization & Analytics Setup Guide

## 1. Frontend Performance Optimizations

### 1.1 Code Splitting & Lazy Loading
```javascript
// Using React.lazy for code splitting
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const Sermons = lazy(() => import('./pages/Sermons'));

// In router
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

**Benefits:**
- Reduces initial bundle size by 30-40%
- Faster page load times
- Better Core Web Vitals scores

### 1.2 Image Optimization
- Use responsive images with `srcset`
- Serve WebP format for modern browsers
- Lazy load images below the fold

Example:
```jsx
<img 
  src="image.jpg" 
  srcSet="image-small.jpg 480w, image-medium.jpg 768w, image-large.jpg 1200w"
  sizes="(max-width: 480px) 100vw, (max-width: 768px) 80vw, 1200px"
  loading="lazy"
  alt="Description"
/>
```

### 1.3 Caching Strategy
- **Service Workers**: Cache assets for offline use
- **HTTP Caching**: Set proper cache headers
- **API Response Caching**: Cache static data locally

```javascript
// Simple localStorage caching
const cacheKey = 'sermons-data';
const cachedSermons = localStorage.getItem(cacheKey);

if (cachedSermons && isStillValid(cachedSermons)) {
  setSermons(JSON.parse(cachedSermons));
} else {
  fetchSermons().then(data => {
    localStorage.setItem(cacheKey, JSON.stringify(data));
  });
}
```

### 1.4 CSS Optimization
- Use Tailwind's purge feature to remove unused CSS
- Minify CSS in production
- Use CSS gradients instead of image backgrounds

### 1.5 Bundle Analysis
```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer

# Configure Vite to use it
# See vite.config.js
```

## 2. Backend Performance Optimizations

### 2.1 Database Query Optimization

**Add Indexes** on frequently queried columns:
```sql
-- In your database migration
CREATE INDEX idx_sermon_date ON sermons(sermon_date DESC);
CREATE INDEX idx_user_id ON members(user_id);
CREATE INDEX idx_announcement_created ON announcements(created_date DESC);
CREATE INDEX idx_event_date ON events(event_date ASC);
```

**Use SELECT ONLY needed columns:**
```java
// Instead of SELECT *
@Query("SELECT new com.example.dto.SermonDto(s.id, s.title, s.speaker) FROM Sermon s")
List<SermonDto> getSermonSummaries();
```

### 2.2 Connection Pooling
Already configured in TiDB Cloud:
- Pool size: 10-20 connections
- Connection timeout: 30 seconds
- Validate connections on checkout

### 2.3 API Response Compression
```yaml
# In application.properties
server.compression.enabled=true
server.compression.min-response-size=1024
```

### 2.4 Pagination for Large Data Sets
```java
@GetMapping("/api/sermons")
public Page<Sermon> getSermons(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("sermonDate").descending());
    return sermonRepository.findAll(pageable);
}
```

### 2.5 Caching Layer (Optional)
```java
import org.springframework.cache.annotation.Cacheable;

@Cacheable("sermons")
@GetMapping("/api/sermons")
public List<Sermon> getAllSermons() {
    return sermonRepository.findAll();
}

// Cache expires after 1 hour
@CacheEvict(value = "sermons", allEntries = true)
@PostMapping("/api/sermons")
public Sermon createSermon(@RequestBody Sermon sermon) {
    return sermonRepository.save(sermon);
}
```

## 3. Search Engine Optimization (SEO)

### 3.1 Meta Tags
```html
<!-- In index.html head -->
<meta name="description" content="EcclesiaSys - Modern Church Management System">
<meta name="keywords" content="church, sermons, announcements, events, management">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta property="og:title" content="EcclesiaSys">
<meta property="og:description" content="Manage your church digitally">
<meta property="og:image" content="your-church-logo.jpg">
```

### 3.2 Structured Data (Schema.org)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Church Name",
  "url": "https://your-domain.com",
  "logo": "https://your-domain.com/logo.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Faith Avenue",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345"
  }
}
```

## 4. Google Analytics 4 Setup

### 4.1 Add GA4 to HTML
```html
<!-- In public/index.html, add in <head> -->
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace `G-XXXXXXXXXX` with your GA4 Measurement ID from Google Analytics Console.

### 4.2 Track Custom Events
```javascript
// In React components
import analytics from '../services/analyticsTracker';

// Already integrated - events are automatically sent
analytics.trackPageView('Sermons');
analytics.trackResourceAccess('SERMON', sermonId, sermonTitle);
analytics.trackUserAction('DOWNLOAD', { type: 'AUDIO' });
```

### 4.3 Monitor Key Metrics in Google Analytics
- **Pageviews**: Track visitor flow
- **Engagement Rate**: Monitor user interest
- **Event Count**: Track specific actions (downloads, shares)
- **Average Session Duration**: Measure engagement time

## 5. Core Web Vitals Optimization

### 5.1 Largest Contentful Paint (LCP) - < 2.5s
- Optimize server response time
- Minimize CSS blocking rendering
- Use CDN for static assets

### 5.2 First Input Delay (FID) - < 100ms
- Reduce JavaScript execution
- Break up long tasks
- Use requestIdleCallback

### 5.3 Cumulative Layout Shift (CLS) - < 0.1
- Set size attributes for images/videos
- Avoid inserting content above other content
- Use `transform: translate()` for animations

## 6. Monitoring & Analytics Dashboard

The system automatically tracks:
- **Session starts/ends**
- **Page views**
- **Resource accesses** (sermons, announcements, events)
- **User actions** (downloads, shares, form submissions)
- **Media engagement** (audio/video play time)
- **Errors** (JavaScript errors, API failures)

### View Analytics
- Local: Check browser console for trackingLogs
- Backend: Query `analytics_events` table
- Google Analytics: Visit analytics.google.com

## 7. Deployment with Performance Settings

### Render Deployment
```yaml
# render.yaml optimizations
services:
  - type: web
    name: ecclesiasys-api
    runtime: java
    buildCommand: "mvn clean package -DskipTests"
    startCommand: "java -Xmx1g -XX:+UseG1GC -jar target/application.jar"
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: production
      - key: SERVER_COMPRESSION_ENABLED
        value: "true"
```

### Frontend Build Optimization
```bash
# In render.yaml frontend build
buildCommand: "npm install && npm run build"

# The build is minified and optimized automatically
```

## 8. Performance Testing

### Load Testing with Apache JMeter
```bash
# Install
brew install jmeter

# Create test scenarios
jmeter -n -t LoadTest.jmx -l results.jtl -j jmeter.log

# Monitor results
jmeter -g results.jtl -o report/
```

### Browser DevTools
1. Open DevTools (F12)
2. Go to **Lighthouse** tab
3. Run audit for Performance, Accessibility, SEO
4. Fix identified issues

## 9. Database Performance Monitoring

### Monitor TiDB Cloud
- Dashboard: https://tidbcloud.com/console
- Check Query Performance
- Monitor Connections
- Review Slow Query Logs

### Optimize Queries
```java
// Use JPA Projections for specific fields
@Repository
public interface SermonRepository extends JpaRepository<Sermon, Long> {
    @Query("SELECT s.id, s.title, s.speaker FROM Sermon s")
    List<Object[]> findSermonSummaries();
}
```

## 10. Checklist for Production Deployment

- [ ] Enable HTTPS/SSL certificate
- [ ] Set up HTTP caching headers
- [ ] Configure CORS properly
- [ ] Enable GZIP compression
- [ ] Set up database indexes
- [ ] Configure Google Analytics
- [ ] Test Core Web Vitals
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Configure backup strategy
- [ ] Set up monitoring/alerts
- [ ] Review security headers
- [ ] Test performance under load
- [ ] Document scaling strategy

## 11. Monitoring Tools (Optional but Recommended)

### Error Tracking
```bash
npm install @sentry/react

# In main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Real User Monitoring (RUM)
- Already integrated via analyticsTracker.js
- Tracks real user interactions
- Monitors performance metrics

## 12. Continuous Improvement

1. **Weekly**: Review Core Web Vitals in Google Analytics
2. **Monthly**: Analyze user behavior and optimize high-traffic pages
3. **Quarterly**: Run load tests and optimize database queries
4. **Yearly**: Technology stack review and upgrade decisions

---

**Last Updated**: $(date)
**Maintained By**: Development Team
