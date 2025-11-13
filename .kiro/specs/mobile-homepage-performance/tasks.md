# Implementation Plan - Mobile Homepage Performance Optimization

## Task List

- [x] 1. Implement Critical CSS Extraction and Inline


  - Extract CSS rules for above-the-fold content (hero section, header, initial viewport)
  - Create `snippets/critical-css.liquid` with inline critical styles
  - Modify `layout/theme.liquid` to inline critical CSS in `<head>`
  - Defer loading of full `styles.css` using preload technique
  - _Requirements: 2.2, 2.3, 9.1, 9.2_





- [ ] 2. Optimize Hero Video Section
  - [ ] 2.1 Create mobile-optimized video version
    - Compress hero video to 480p for mobile (target: <2MB)
    - Generate poster image from video first frame

    - Upload optimized assets to Shopify
    - _Requirements: 1.3, 7.1_
  
  - [ ] 2.2 Update background-video-responsive section
    - Add poster attribute to video element
    - Implement conditional video loading (mobile vs desktop)




    - Add `fetchpriority="high"` for hero video
    - Add preload hint for poster image
    - Set `preload="metadata"` for video element
    - _Requirements: 1.2, 1.4, 7.1, 7.5_



- [ ] 3. Implement Lazy Loading System
  - [ ] 3.1 Enhance performance-optimizer.js with lazy loading
    - Improve IntersectionObserver implementation with 50px rootMargin
    - Add support for lazy loading videos


    - Add fallback for browsers without IntersectionObserver
    - Implement error handling for failed loads
    - _Requirements: 4.2, 4.4, 7.2, 7.4_




  
  - [ ] 3.2 Update two-banner sections for lazy loading
    - Add `loading="lazy"` to images below fold
    - Add `data-src` attributes for lazy loaded images


    - Implement skeleton loaders for better UX
    - _Requirements: 4.2, 4.3_
  
  - [ ] 3.3 Update featured-collection section for lazy loading
    - Implement intersection observer for collection section

    - Add skeleton loader placeholder
    - Fetch collection content when entering viewport
    - _Requirements: 4.2, 4.3_


- [x] 4. Optimize JavaScript Loading and Execution

  - [ ] 4.1 Extract cart drawer functionality
    - Create new `assets/cart-drawer.js` file
    - Move cart drawer logic from `theme.js` to separate file
    - Implement dynamic import for cart drawer
    - _Requirements: 3.2, 3.4, 8.4_

  
  - [ ] 4.2 Optimize inline scripts in theme.liquid
    - Minimize theme configuration object
    - Move non-critical inline scripts to external file





    - Defer viewport calculation scripts
    - Remove or defer animation initialization scripts
    - _Requirements: 3.2, 3.3, 8.1, 8.5_
  


  - [ ] 4.3 Update script loading in theme.liquid
    - Ensure all scripts use `defer` attribute



    - Move scripts to end of body
    - Add async loading for non-critical scripts
    - _Requirements: 3.4, 8.1_

- [ ] 5. Optimize CSS Delivery
  - [x] 5.1 Implement CSS preloading strategy

    - Update `layout/theme.liquid` to preload main stylesheet
    - Add onload handler to convert preload to stylesheet
    - Add noscript fallback for stylesheet
    - _Requirements: 9.1, 9.2_



  
  - [ ] 5.2 Defer non-critical CSS
    - Load `theme-addons.css` with media="print" trick
    - Defer loading of review/rating CSS
    - Remove unused CSS rules from main stylesheet


    - _Requirements: 2.3, 9.2, 9.4_




- [ ] 6. Optimize Font Loading
  - [ ] 6.1 Reduce font variants loaded
    - Identify and remove unused font variants
    - Keep only base_font and heading_font in initial load
    - Load additional variants (bold, italic) on-demand


    - _Requirements: 2.5, 5.2_
  
  - [x] 6.2 Implement font preloading




    - Add preload hints for critical fonts
    - Ensure all fonts use `font-display: swap`
    - Add font loading timeout handler
    - _Requirements: 2.5_



- [ ] 7. Implement Responsive Images with Srcset
  - [x] 7.1 Update two-banner section images

    - Add srcset with multiple image sizes (400w, 800w, 1200w)
    - Add sizes attribute for responsive sizing
    - Add explicit width and height attributes
    - Use WebP format with fallback
    - _Requirements: 1.5, 5.1, 5.2, 6.2_
  



  - [ ] 7.2 Update featured-collection product images
    - Implement srcset for product images
    - Add explicit dimensions to prevent CLS
    - Optimize image sizes for mobile
    - _Requirements: 5.1, 5.2, 6.2_

- [ ] 8. Optimize Third-Party Scripts
  - [x] 8.1 Defer analytics and tracking scripts

    - Move Clarity analytics to load event
    - Defer pixel tracking initialization
    - Move session ID generation to async function
    - _Requirements: 3.2, 3.5_
  
  - [x] 8.2 Update snippets/pixel.liquid

    - Wrap pixel code in load event listener
    - Add error handling for failed tracking
    - _Requirements: 3.5_

- [ ] 9. Optimize Animations
  - [ ] 9.1 Simplify animation initialization
    - Defer animation setup until after page load
    - Use requestAnimationFrame for scroll animations
    - Remove opacity fade-in that blocks rendering
    - _Requirements: 3.3, 6.5_
  
  - [ ] 9.2 Update performance-optimizer.css
    - Use CSS transforms instead of layout properties
    - Add will-change hints for animated elements
    - Optimize animations for mobile devices
    - _Requirements: 6.5_

- [ ] 10. Implement Performance Monitoring
  - [ ] 10.1 Add Web Vitals tracking
    - Install web-vitals library or implement custom tracking
    - Track LCP, FCP, CLS, FID, TTFB metrics
    - Send metrics to analytics endpoint
    - _Requirements: 10.1, 10.2_
  
  - [ ] 10.2 Implement performance budget alerts
    - Define performance budget thresholds
    - Add console warnings when budgets exceeded
    - Log performance data for monitoring
    - _Requirements: 10.3, 10.4_

- [ ] 11. Prevent Cumulative Layout Shift (CLS)
  - Add explicit width/height to all images in index.json sections
  - Implement aspect ratio boxes for video elements
  - Reserve space for lazy-loaded content
  - Test and fix any layout shifts during load
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 12. Final Testing and Validation
  - [ ] 12.1 Run Lighthouse tests
    - Test on mobile device (Moto G4, Slow 3G)
    - Verify LCP < 2.5s
    - Verify FCP < 1.8s
    - Verify TBT < 200ms
    - Verify Speed Index < 3.4s
    - Verify CLS < 0.1
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1_
  
  - [ ] 12.2 Cross-browser testing
    - Test on Chrome, Safari, Firefox mobile
    - Verify lazy loading works correctly
    - Test fallbacks for older browsers
    - Verify accessibility with screen readers
    - _Requirements: All requirements_
  
  - [ ] 12.3 Real device testing
    - Test on actual mobile devices (iOS and Android)
    - Verify video playback on mobile
    - Test on slow 3G network
    - Validate user experience improvements
    - _Requirements: All requirements_

- [ ]* 13. Documentation and Monitoring Setup
  - Document performance optimization changes
  - Set up continuous performance monitoring
  - Create performance dashboard
  - Document rollback procedures
  - _Requirements: 10.1, 10.2, 10.5_
