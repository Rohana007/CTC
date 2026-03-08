/**
 * Input Validation Utilities for Lambda Functions
 * 
 * Provides validation helpers for API request parameters
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate required fields are present
 */
export function validateRequired(
  data: any,
  requiredFields: string[]
): ValidationResult {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): ValidationResult {
  const errors: string[] = [];

  if (minLength !== undefined && value.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters`);
  }

  if (maxLength !== undefined && value.length > maxLength) {
    errors.push(`${fieldName} must not exceed ${maxLength} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate language code
 */
export function validateLanguageCode(language: string): ValidationResult {
  const validLanguages = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu', 'kn', 'ml', 'pa'];
  
  if (!validLanguages.includes(language)) {
    return {
      isValid: false,
      errors: [`Invalid language code: ${language}. Must be one of: ${validLanguages.join(', ')}`]
    };
  }

  return {
    isValid: true,
    errors: []
  };
}

/**
 * Validate programming language
 */
export function validateProgrammingLanguage(language: string): ValidationResult {
  const validLanguages = [
    'python', 'javascript', 'typescript', 'java', 'cpp', 'c', 
    'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin'
  ];
  
  if (!validLanguages.includes(language.toLowerCase())) {
    return {
      isValid: false,
      errors: [`Invalid programming language: ${language}. Must be one of: ${validLanguages.join(', ')}`]
    };
  }

  return {
    isValid: true,
    errors: []
  };
}

/**
 * Validate complexity level
 */
export function validateComplexityLevel(level: string): ValidationResult {
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  
  if (!validLevels.includes(level)) {
    return {
      isValid: false,
      errors: [`Invalid complexity level: ${level}. Must be one of: ${validLevels.join(', ')}`]
    };
  }

  return {
    isValid: true,
    errors: []
  };
}

/**
 * Validate base64 image
 */
export function validateBase64Image(
  imageBase64: string,
  maxSizeMB: number = 5
): ValidationResult {
  const errors: string[] = [];

  // Check if it's valid base64
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(imageBase64)) {
    errors.push('Invalid base64 format');
  }

  // Check size
  const sizeBytes = (imageBase64.length * 3) / 4;
  const sizeMB = sizeBytes / (1024 * 1024);
  
  if (sizeMB > maxSizeMB) {
    errors.push(`Image size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Combine multiple validation results
 */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(r => r.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}
