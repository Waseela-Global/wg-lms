import React from 'react'

/**
 * Lazy load component with loading fallback
 * @param {Function} importFunc - Dynamic import function
 * @returns {React.Component} - Lazy loaded component
 */
export function lazyLoad(importFunc) {
  const LazyComponent = React.lazy(importFunc)
  
  return function LazyLoadWrapper(props) {
    return (
      <React.Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="spinner border-primary-600"></div>
          </div>
        }
      >
        <LazyComponent {...props} />
      </React.Suspense>
    )
  }
}

/**
 * Preload image to improve UX
 * @param {string} src - Image source URL
 * @returns {Promise} - Promise that resolves when image is loaded
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Lazy load images when they enter viewport
 * @param {HTMLElement} element - Image element to observe
 * @param {string} src - Image source URL
 */
export function lazyLoadImage(element, src) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          element.src = src
          observer.unobserve(element)
        }
      })
    })
    
    observer.observe(element)
  } else {
    // Fallback for older browsers
    element.src = src
  }
}

