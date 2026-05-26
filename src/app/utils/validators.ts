/** Returns true if the value is a valid email address */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Returns true if the phone number is a valid Jordanian mobile number:
 * - Exactly 10 digits
 * - Starts with 077, 078, or 079
 */
export function isValidPhone(value: string): boolean {
  return /^07[789]\d{7}$/.test(value.trim());
}

/**
 * Strips any character that is NOT a digit from a phone string.
 * Limits input to 10 characters to match Jordanian number length.
 * Use in onChange handlers to prevent non-numeric input.
 */
export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

/**
 * Returns true if the value contains only Arabic/Latin letters and spaces
 * (no digits or special characters).
 */
export function isLettersOnly(value: string): boolean {
  // Matches Arabic Unicode range + Latin letters + spaces
  return /^[\u0600-\u06FFa-zA-Z\s]+$/.test(value.trim());
}

/**
 * Returns true if the password satisfies:
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one number
 * - Contains at least one special character
 */
export function isValidPassword(value: string): boolean {
  return /(?=.*[A-Z])/.test(value) && /(?=.*\d)/.test(value) && /(?=.*[!@#$%^&*(),.?":{}|<>_])/.test(value) && value.length >= 8;
}
