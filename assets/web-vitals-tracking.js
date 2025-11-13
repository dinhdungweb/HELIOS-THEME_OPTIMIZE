/**
 * Web Vitals Tracking
 * Tracks Core Web Vitals metrics for performance monitoring
 */

(function() {
  'use strict';

  // Web Vitals Tracker
  const WebVitalsTracker = {
    
    // Send metric to analytics
    sendToAnalytics: function(metric) {
      const body = JSON.stringify({
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        delta: Math.round(metric.delta),
        id: metric.id,
        page: window.location.pathname,
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
        timestamp: Date.now()
      });

      // Send to analytics endpoint using sendBeacon
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/a/web_vitals', body);
      }

      // Also log to console in development
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('myshopify.com')) {
        console.log('[Web Vitals]', metric.name, Math.round(metric.value), metric.rating);
      }

      // Push to dataLayer for GTM
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'web_vitals',
          metric_name: metric.name,
          metric_value: Math.round(metric.value),
          metric_rating: metric.rating
        });
      }
    },

    // Get Cumulative Layout Shift (CLS)
    getCLS: function(callback) {
      let clsValue = 0;
      let clsEntries = [];
      let sessionValue = 0;
      let sessionEntries = [];

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              clsEntries = sessionEntries;
            }
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });

      // Report CLS on page hide
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          callback({
            name: 'CLS',
            value: clsValue,
            rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
            delta: clsValue,
            id: 'v3-' + Date.now()
          });
        }
      });
    },

    // Get Largest Contentful Paint (LCP)
    getLCP: function(callback) {
      let lcpValue = 0;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcpValue = lastEntry.renderTime || lastEntry.loadTime;
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });

      // Report LCP on page hide
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          callback({
            name: 'LCP',
            value: lcpValue,
            rating: lcpValue < 2500 ? 'good' : lcpValue < 4000 ? 'needs-improvement' : 'poor',
            delta: lcpValue,
            id: 'v3-' + Date.now()
          });
        }
      });
    },

    // Get First Input Delay (FID)
    getFID: function(callback) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: entry.processingStart - entry.startTime < 100 ? 'good' : 
                    entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor',
            delta: entry.processingStart - entry.startTime,
            id: 'v3-' + Date.now()
          });
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
    },

    // Get First Contentful Paint (FCP)
    getFCP: function(callback) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            callback({
              name: 'FCP',
              value: entry.startTime,
              rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs-improvement' : 'poor',
              delta: entry.startTime,
              id: 'v3-' + Date.now()
            });
          }
        }
      });

      observer.observe({ type: 'paint', buffered: true });
    },

    // Get Time to First Byte (TTFB)
    getTTFB: function(callback) {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        callback({
          name: 'TTFB',
          value: ttfb,
          rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor',
          delta: ttfb,
          id: 'v3-' + Date.now()
        });
      }
    },

    // Initialize tracking
    init: function() {
      // Check if browser supports Performance Observer
      if (!('PerformanceObserver' in window)) {
        console.warn('PerformanceObserver not supported');
        return;
      }

      // Track all Core Web Vitals
      this.getCLS(this.sendToAnalytics);
      this.getLCP(this.sendToAnalytics);
      this.getFID(this.sendToAnalytics);
      this.getFCP(this.sendToAnalytics);
      this.getTTFB(this.sendToAnalytics);
    }
  };

  // Initialize after page load
  window.addEventListener('load', function() {
    // Delay tracking slightly to not impact performance
    setTimeout(function() {
      WebVitalsTracker.init();
    }, 1000);
  });

  // Performance Budget Checker
  const PerformanceBudget = {
    budgets: {
      LCP: 2500,
      FCP: 1800,
      CLS: 0.1,
      FID: 100,
      TTFB: 800
    },

    checkBudget: function(metric) {
      const budget = this.budgets[metric.name];
      if (!budget) return;

      if (metric.value > budget) {
        console.warn(
          `⚠️ Performance Budget Exceeded: ${metric.name}`,
          `\nActual: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
          `\nBudget: ${budget}${metric.name === 'CLS' ? '' : 'ms'}`,
          `\nOverage: ${Math.round(metric.value - budget)}${metric.name === 'CLS' ? '' : 'ms'}`
        );

        // Send alert to analytics
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'performance_budget_exceeded',
            metric_name: metric.name,
            metric_value: Math.round(metric.value),
            budget_value: budget,
            overage: Math.round(metric.value - budget)
          });
        }
      } else {
        console.log(
          `✅ Performance Budget Met: ${metric.name}`,
          `${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'} / ${budget}${metric.name === 'CLS' ? '' : 'ms'}`
        );
      }
    }
  };

  // Wrap sendToAnalytics to include budget check
  const originalSendToAnalytics = WebVitalsTracker.sendToAnalytics;
  WebVitalsTracker.sendToAnalytics = function(metric) {
    PerformanceBudget.checkBudget(metric);
    originalSendToAnalytics.call(this, metric);
  };

  // Expose to window for manual tracking
  window.WebVitalsTracker = WebVitalsTracker;
  window.PerformanceBudget = PerformanceBudget;

})();
