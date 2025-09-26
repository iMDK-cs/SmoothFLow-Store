/**
 * Security utilities for XSS protection and input sanitization
 * Server-safe implementation that works in both client and server environments
 */

// Server-safe sanitization function
const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags and dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
    .replace(/[<>]/g, ''); // Remove any remaining angle brackets
};

export const sanitizeUserInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  const clean = sanitizeHtml(input);
  return clean.trim().substring(0, 100);
};

export const sanitizeNotes = (notes: string): string => {
  if (!notes || typeof notes !== 'string') return '';
  
  const clean = sanitizeHtml(notes);
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
