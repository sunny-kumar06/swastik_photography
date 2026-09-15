/**
 * Universal validation & sanitization helpers for Swastik Photography forms
 * Enforces strict 10-digit phone numbers and valid email formats
 */

/**
 * Sanitizes phone input in real time:
 * - Keeps digits only
 * - Strips leading country code '+91' or '91' if pasted as 12 digits
 * - Restricts length strictly to 10 digits
 */
export const sanitizePhoneNumber = (val) => {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2, 12);
  }
  return digits.slice(0, 10);
};

/**
 * Checks if the phone number is a valid 10-digit mobile number
 * (Starts with 6, 7, 8, or 9 for Indian telecommunications)
 */
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(digits);
};

/**
 * Checks if phone is exactly 10 digits
 */
export const is10DigitPhone = (phone) => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return /^\d{10}$/.test(digits);
};

/**
 * Validates email format strictly: username@domain.extension
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
};
