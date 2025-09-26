/**
 * Security utilities for XSS protection and input sanitization
 */

// For client-side sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// For server-side sanitization (when DOMPurify is available)
export const sanitizeForServer = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Basic sanitization for server-side
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Validate user input length and content
export const validateUserInput = (input: string, maxLength: number = 1000): boolean => {
  if (typeof input !== 'string') {
    return false;
  }
  
  if (input.length > maxLength) {
    return false;
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /<style/i
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(input));
};

// Sanitize user name specifically
export const sanitizeUserName = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  // Remove any HTML tags and scripts
  let sanitized = name
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining angle brackets
    .trim();
  
  // Limit length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  return sanitized;
};

// Sanitize notes/comments
export const sanitizeNotes = (notes: string): string => {
  if (!notes || typeof notes !== 'string') {
    return '';
  }
  
  // Remove script tags and dangerous attributes
  let sanitized = notes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // Limit length
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
  }
  
  return sanitized;
};
