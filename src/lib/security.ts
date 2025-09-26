/**
 * Security utilities for XSS protection and input sanitization using DOMPurify
 */
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeUserInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Use DOMPurify to remove all HTML
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  });
  
  return clean.trim().substring(0, 100);
};

export const sanitizeNotes = (notes: string): string => {
  if (!notes || typeof notes !== 'string') return '';
  
  const clean = DOMPurify.sanitize(notes, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  });
  
  return clean.trim().substring(0, 2000);
};

export const validateUserInput = (input: string, maxLength: number = 1000): boolean => {
  if (!input || typeof input !== 'string') return false;
  return input.length <= maxLength;
};

// Legacy functions for backward compatibility
export const sanitizeInput = sanitizeUserInput;
export const sanitizeUserName = sanitizeUserInput;
export const sanitizeForServer = sanitizeUserInput;
