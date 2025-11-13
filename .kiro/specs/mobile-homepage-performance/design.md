# Design Document - Mobile Homepage Performance Optimization

## Overview

This design document outlines the technical approach to optimize the mobile homepage performance for the Helios Shopify theme. The optimization focuses on reducing LCP from 4.6s to <2.5s, FCP from 4s to <1.8s, TBT from 320ms to <200ms, and Speed Index from 6.4s to <3.4s.

## Architecture

### Performance Optimization Strategy

The optimization follows a three-tier approach:

1. **Critical Path Optimization**: Minimize render-blocking resources and prioritize above-the-fold content
2. **Resource Loading Strategy**: Implement lazy loading, code splitting, and progressive enhancement
3. **Runtime Performance**: Reduce JavaScript execution time and optimize animations

### Key Components

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Request                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              HTML Document (Optimized)                   │
│  • Inline Critical CSS                                   │
│  • Preload LCP Resource (Hero Video/Image)              │
│  • Minimal Inline Scripts                                │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                     ↓
┌──────────────────┐              ┌──────────────────────┐
│  Above the Fold  │              │  Below the Fold      │
│  • Hero Section  │              │  • Lazy Loaded       │
│  • Critical CSS  │              │  • Deferred JS       │
│  • Priority Load │              │  • Async Resources   │
└──────────────────┘              └──────────────────────┘
```

## Components and Interfaces

### 1. Critical CSS Extraction

**Purpose**: Inline only the CSS needed for above-the-fold content

**Implementation**:
- Extract CSS rules for hero section, header, and initial viewport
- Inline in `<head>` within `<style>` tag
- Defer loading of full stylesheet

**Files Modified**:
- `layout/theme.liquid`
- New file: `snippets/critical-css.liquid`

### 2. Hero Video Optimization

**Purpose**: Optimize the background video that serves as LCP element

**Implementation**:
```liquid
<!-- Optimized Hero Video -->
<video 
  poster="{{ 'hero-poster-mobile.jpg' | asset_url }}"
  preload="metadata"
  playsinline
  muted
  loop
  {% if section.settings.video_priority %}fetchpriority="high"{% endif %}
>
  <source src="{{ video_mobile_url }}" type="video/mp4">
</video>
```

**Features**:
- Poster image for immediate visual feedback
- Separate mobile-optimized video (smaller resolution)
- Preload hint for LCP element
- Lazy load for non-hero videos

**Files Modified**:
- `sections/background-video-responsive.liquid`

### 3. Lazy Loading System

**Purpose**: Defer loading of below-the-fold images and videos

**Implementation**:
```javascript
// Enhanced Lazy Loading with Intersection Observer
const lazyLoadObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target;
      
      if (element.tagName === 'IMG') {
        element.src = element.dataset.src;
        if (element.dataset.srcset) {
          element.srcset = element.dataset.srcset;
        }
      } else if (element.tagName === 'VIDEO') {
        element.load();
      }
      
      element.classList.add('loaded');
      lazyLoadObserver.unobserve(element);
    }
  });
}, {
  rootMargin: '50px' // Start loading 50px before entering viewport
});
```

**Files Modified**:
- `assets/performance-optimizer.js` (enhance existing)
- `sections/two-banner.liquid`
- `sections/featured-collection.liquid`

### 4. JavaScript Optimization

**Purpose**: Reduce TBT by deferring non-critical JavaScript

**Strategy**:
1. Move all non-critical scripts to end of body with `defer`
2. Split cart drawer functionality into separate bundle
3. Use dynamic imports for interactive features
4. Minimize inline scripts

**Implementation**:
```liquid
<!-- Critical inline scripts only -->
<script>
  // Minimal theme config
  window.theme = { routes: {...}, money_format: '...' };
</script>

<!-- Deferred scripts -->
<script src="{{ 'vendor.min.js' | asset_url }}" defer></script>
<script src="{{ 'theme.js' | asset_url }}" defer></script>

<!-- Lazy load cart drawer -->
<script>
  window.addEventListener('load', () => {
    import('{{ 'cart-drawer.js' | asset_url }}');
  });
</script>
```

**Files Modified**:
- `layout/theme.liquid`
- New file: `assets/cart-drawer.js` (extracted from theme.js)

### 5. CSS Delivery Optimization

**Purpose**: Eliminate render-blocking CSS

**Implementation**:
```liquid
<!-- Inline critical CSS -->
<style>
  {% render 'critical-css' %}
</style>

<!-- Preload full stylesheet -->
<link rel="preload" href="{{ 'styles.css' | asset_url }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="{{ 'styles.css' | asset_url }}"></noscript>

<!-- Defer non-critical CSS -->
<link rel="stylesheet" href="{{ 'theme-addons.css' | asset_url }}" media="print" onload="this.media='all'">
```

**Files Modified**:
- `layout/theme.liquid`
- New file: `snippets/critical-css.liquid`

### 6. Font Loading Optimization

**Purpose**: Reduce font-related render blocking

**Implementation**:
```liquid
<!-- Preload only essential fonts -->
<link rel="preload" href="{{ base_font | font_url }}" as="font" type="font/woff2" crossorigin>

<!-- Font face with font-display: swap -->
<style>
  {{ base_font | font_face: font_display: 'swap' }}
  {{ heading_font | font_face: font_display: 'swap' }}
  /* Load other variants asynchronously */
</style>
```

**Strategy**:
- Preload only base and heading fonts
- Use font-display: swap for all fonts
- Load font variants (bold, italic) on-demand

**Files Modified**:
- `layout/theme.liquid`

### 7. Image Optimization

**Purpose**: Serve appropriately sized images with modern formats

**Implementation**:
```liquid
<!-- Responsive images with srcset -->
<img
  src="{{ image | image_url: width: 800 }}"
  srcset="
    {{ image | image_url: width: 400 }} 400w,
    {{ image | image_url: width: 800 }} 800w,
    {{ image | image_url: width: 1200 }} 1200w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  width="{{ image.width }}"
  height="{{ image.height }}"
  loading="lazy"
  alt="{{ image.alt }}"
>
```

**Features**:
- Responsive images with srcset
- Explicit width/height to prevent CLS
- Native lazy loading for below-fold images
- WebP format with fallback

**Files Modified**:
- `sections/two-banner.liquid`
- `sections/featured-collection.liquid`

### 8. Third-Party Script Optimization

**Purpose**: Minimize impact of analytics and tracking scripts

**Implementation**:
```liquid
<!-- Defer third-party scripts -->
<script>
  window.addEventListener('load', () => {
    // Load Clarity after page load
    {% render "pixel" %}
    
    // Initialize session tracking
    const sessionId = localStorage.getItem('sessionID') || generateSessionId();
    clarity('set', 'user_id', sessionId);
  });
</script>
```

**Files Modified**:
- `layout/theme.liquid`
- `snippets/pixel.liquid`

### 9. Animation Optimization

**Purpose**: Reduce animation impact on performance

**Implementation**:
```javascript
// Simplified animation logic
if (window.innerWidth < 768 && 'IntersectionObserver' in window) {
  document.body.classList.add('cc-animate-enabled');
  
  // Use requestAnimationFrame for smooth animations
  const animateOnScroll = () => {
    requestAnimationFrame(() => {
      // Animation logic
    });
  };
}
```

**Strategy**:
- Use CSS transforms instead of layout-triggering properties
- Defer animation initialization until after load
- Use requestAnimationFrame for smooth animations

**Files Modified**:
- `layout/theme.liquid`
- `assets/performance-optimizer.css`

### 10. Featured Collection Optimization

**Purpose**: Lazy load product grid below the fold

**Implementation**:
```liquid
<!-- Lazy load featured collection -->
<div class="featured-collection" data-lazy-section>
  <div class="skeleton-loader">
    <!-- Placeholder content -->
  </div>
</div>

<script>
  // Load collection when in viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fetch('/?section_id=featured-collection')
          .then(res => res.text())
          .then(html => {
            entry.target.innerHTML = html;
          });
        observer.unobserve(entry.target);
      }
    });
  });
</script>
```

**Files Modified**:
- `sections/featured-collection.liquid`
- `templates/index.json`

## Data Models

### Performance Budget

```javascript
const performanceBudget = {
  lcp: 2500,        // milliseconds
  fcp: 1800,        // milliseconds
  tbt: 200,         // milliseconds
  speedIndex: 3400, // milliseconds
  cls: 0.1,         // score
  
  resources: {
    html: 50,       // KB
    css: 100,       // KB
    js: 200,        // KB
    images: 500,    // KB (above fold)
    fonts: 100      // KB
  }
};
```

### Resource Loading Priority

```javascript
const loadingPriority = {
  critical: [
    'hero-poster.jpg',
    'critical.css',
    'base-font.woff2'
  ],
  high: [
    'hero-video.mp4',
    'header-logo.svg',
    'styles.css'
  ],
  medium: [
    'vendor.min.js',
    'theme.js'
  ],
  low: [
    'theme-addons.js',
    'analytics.js',
    'below-fold-images'
  ]
};
```

## Error Handling

### Lazy Loading Fallback

```javascript
// Fallback for browsers without IntersectionObserver
if (!('IntersectionObserver' in window)) {
  // Load all images immediately
  document.querySelectorAll('img[data-src]').forEach(img => {
    img.src = img.dataset.src;
  });
}
```

### Video Loading Error

```javascript
video.addEventListener('error', (e) => {
  console.error('Video loading failed:', e);
  // Show poster image as fallback
  video.style.display = 'none';
  video.poster && showPosterImage(video.poster);
});
```

### Font Loading Timeout

```javascript
// Timeout for font loading
document.fonts.ready.then(() => {
  document.body.classList.add('fonts-loaded');
});

setTimeout(() => {
  if (!document.body.classList.contains('fonts-loaded')) {
    document.body.classList.add('fonts-timeout');
  }
}, 3000);
```

## Testing Strategy

### Performance Testing

1. **Lighthouse CI**: Run automated Lighthouse tests on every deployment
2. **Real User Monitoring**: Track Core Web Vitals from actual users
3. **Synthetic Testing**: Use WebPageTest for detailed performance analysis

### Test Scenarios

```javascript
// Performance test cases
const testScenarios = [
  {
    name: 'Mobile 3G',
    device: 'Moto G4',
    network: 'Slow 3G',
    targets: { lcp: 2500, fcp: 1800 }
  },
  {
    name: 'Mobile 4G',
    device: 'iPhone 12',
    network: '4G',
    targets: { lcp: 2000, fcp: 1500 }
  }
];
```

### Validation Checklist

- [ ] LCP < 2.5s on mobile 3G
- [ ] FCP < 1.8s on mobile 3G
- [ ] TBT < 200ms
- [ ] Speed Index < 3.4s
- [ ] CLS < 0.1
- [ ] All images have width/height
- [ ] Critical CSS inlined
- [ ] Non-critical JS deferred
- [ ] Videos have poster images
- [ ] Fonts use font-display: swap

## Implementation Phases

### Phase 1: Critical Path Optimization (Highest Impact)
1. Inline critical CSS
2. Optimize hero video with poster
3. Defer non-critical JavaScript
4. Preload LCP element

**Expected Impact**: LCP -1.5s, FCP -1.5s

### Phase 2: Resource Loading (High Impact)
1. Implement lazy loading for images
2. Lazy load featured collection
3. Optimize font loading
4. Defer third-party scripts

**Expected Impact**: TBT -100ms, Speed Index -2s

### Phase 3: Fine-tuning (Medium Impact)
1. Code splitting for cart drawer
2. Optimize animations
3. Remove unused CSS/JS
4. Implement performance monitoring

**Expected Impact**: TBT -50ms, Overall polish

## Performance Monitoring

### Web Vitals Tracking

```javascript
// Track Core Web Vitals
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    page: window.location.pathname
  });
  
  navigator.sendBeacon('/analytics', body);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Performance Budget Monitoring

```javascript
// Alert when budget exceeded
const checkPerformanceBudget = () => {
  const metrics = performance.getEntriesByType('navigation')[0];
  
  if (metrics.domContentLoadedEventEnd > 3000) {
    console.warn('Performance budget exceeded: DCL > 3s');
  }
};

window.addEventListener('load', checkPerformanceBudget);
```

## Design Decisions and Rationale

### 1. Why Inline Critical CSS?
- Eliminates render-blocking CSS request
- Reduces FCP by 1-2 seconds
- Trade-off: Slightly larger HTML, but worth it for mobile

### 2. Why Separate Mobile Video?
- Mobile users don't need 1080p video
- 480p video is 70% smaller
- Significantly improves LCP

### 3. Why Defer Cart Drawer JS?
- Cart drawer not needed for initial page view
- Reduces TBT by ~100ms
- Loads on-demand when user interacts

### 4. Why Lazy Load Featured Collection?
- Products below fold don't need immediate load
- Reduces initial payload by ~200KB
- Improves Speed Index

### 5. Why Limit Font Variants?
- 7 font variants = ~300KB
- Most pages only use 2-3 variants
- Load variants on-demand

## Browser Compatibility

- Modern browsers: Full optimization
- IE11: Graceful degradation (no lazy loading)
- Safari: Special handling for video autoplay
- Chrome/Edge: Full support for all features

## Accessibility Considerations

- Maintain alt text for all images
- Ensure lazy-loaded content is keyboard accessible
- Preserve focus management
- Maintain ARIA labels
- Test with screen readers

## Security Considerations

- Validate all user inputs in performance monitoring
- Sanitize analytics data before sending
- Use CSP headers for inline scripts
- Ensure third-party scripts are from trusted sources
