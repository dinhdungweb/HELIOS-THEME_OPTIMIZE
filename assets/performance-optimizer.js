/**
 * Performance Optimizer Script
 * Improves page loading speed through various optimizations
 */

(function() {
  'use strict';

  // Performance optimization utilities
  const PerformanceOptimizer = {
    
    // Initialize all optimizations
    init: function() {
      this.optimizeImages();
      this.deferNonCriticalCSS();
      this.preloadCriticalResources();
      this.optimizeScrolling();
      this.addLoadingStates();
    },

    // Optimize image loading with enhanced lazy loading
    optimizeImages: function() {
      // Enhanced intersection observer for lazy loading with 50px rootMargin
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target;
              
              // Handle images
              if (element.tagName === 'IMG') {
                if (element.dataset.src) {
                  element.src = element.dataset.src;
                }
                if (element.dataset.srcset) {
                  element.srcset = element.dataset.srcset;
                }
                element.classList.remove('lazy');
                element.classList.add('loaded');
              }
              
              // Handle videos
              else if (element.tagName === 'VIDEO') {
                if (element.dataset.src) {
                  element.src = element.dataset.src;
                  element.load();
                }
                element.classList.add('loaded');
              }
              
              // Handle background images
              else if (element.dataset.bgSrc) {
                element.style.backgroundImage = `url(${element.dataset.bgSrc})`;
                element.classList.add('loaded');
              }
              
              observer.unobserve(element);
            }
          });
        }, {
          rootMargin: '50px', // Start loading 50px before entering viewport
          threshold: 0.01
        });

        // Observe all lazy images
        document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
          imageObserver.observe(img);
        });
        
        // Observe all lazy videos
        document.querySelectorAll('video[data-src]').forEach(video => {
          imageObserver.observe(video);
        });
        
        // Observe elements with background images
        document.querySelectorAll('[data-bg-src]').forEach(el => {
          imageObserver.observe(el);
        });
      } else {
        // Fallback for browsers without IntersectionObserver
        this.loadAllImagesImmediately();
      }
    },
    
    // Fallback: Load all images immediately for older browsers
    loadAllImagesImmediately: function() {
      document.querySelectorAll('img[data-src]').forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
      });
      
      document.querySelectorAll('video[data-src]').forEach(video => {
        if (video.dataset.src) {
          video.src = video.dataset.src;
          video.load();
        }
      });
      
      document.querySelectorAll('[data-bg-src]').forEach(el => {
        el.style.backgroundImage = `url(${el.dataset.bgSrc})`;
      });
    },

    // Defer non-critical CSS
    deferNonCriticalCSS: function() {
      const nonCriticalCSS = [
        'theme-addons.css',
        'judgeme-reviews.css',
        'account.css'
      ];

      nonCriticalCSS.forEach(cssFile => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = window.Shopify.routes.root + 'assets/' + cssFile;
        link.media = 'print';
        link.onload = function() { this.media = 'all'; };
        document.head.appendChild(link);
      });
    },

    // Preload critical resources
    preloadCriticalResources: function() {
      const criticalResources = [
        { href: window.Shopify.routes.root + 'assets/vendor.min.js', as: 'script' },
        { href: window.Shopify.routes.root + 'assets/theme.js', as: 'script' }
      ];

      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        document.head.appendChild(link);
      });
    },

    // Optimize scrolling performance
    optimizeScrolling: function() {
      let ticking = false;

      function updateScrollPosition() {
        // Add scroll-based optimizations here
        ticking = false;
      }

      function requestTick() {
        if (!ticking) {
          requestAnimationFrame(updateScrollPosition);
          ticking = true;
        }
      }

      window.addEventListener('scroll', requestTick, { passive: true });
    },

    // Add loading states
    addLoadingStates: function() {
      // Remove loading class when page is fully loaded
      window.addEventListener('load', () => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        
        // Hide preloader
        const preloader = document.getElementById('preloader');
        if (preloader) {
          preloader.classList.add('hidden');
          setTimeout(() => {
            preloader.style.display = 'none';
          }, 500);
        }
      });

      // Add fade-in animation for content
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      });

      // Observe all sections for fade-in animation
      document.querySelectorAll('section, .section').forEach(section => {
        observer.observe(section);
      });
    }
  };

  // Add error handling for failed image/video loads
  PerformanceOptimizer.handleLoadErrors = function() {
    // Handle image load errors
    document.addEventListener('error', function(e) {
      if (e.target.tagName === 'IMG') {
        console.warn('Image failed to load:', e.target.src);
        e.target.classList.add('load-error');
        // Optionally show placeholder
      } else if (e.target.tagName === 'VIDEO') {
        console.warn('Video failed to load:', e.target.src);
        e.target.classList.add('load-error');
        // Show poster image as fallback
        if (e.target.poster) {
          e.target.style.display = 'none';
          const posterImg = document.createElement('img');
          posterImg.src = e.target.poster;
          posterImg.alt = 'Video thumbnail';
          e.target.parentNode.insertBefore(posterImg, e.target);
        }
      }
    }, true);
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PerformanceOptimizer.init();
      PerformanceOptimizer.handleLoadErrors();
    });
  } else {
    PerformanceOptimizer.init();
    PerformanceOptimizer.handleLoadErrors();
  }

})();