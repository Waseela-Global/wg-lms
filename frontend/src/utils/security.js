// Security utilities

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHTML(html) {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Escape special characters for regex
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
export function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
export function isValidURL(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Rate limiter for API calls
 * @param {Function} fn - Function to rate limit
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Rate limited function
 */
export function rateLimit(fn, delay = 1000) {
  let timeoutId = null
  let lastArgs = null
  
  return function (...args) {
    lastArgs = args
    
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        fn.apply(this, lastArgs)
        timeoutId = null
      }, delay)
    }
  }
}

/**
 * Debounce function calls
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(fn, delay = 300) {
  let timeoutId = null
  
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

