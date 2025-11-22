import { hash, compare, genSalt } from 'bcryptjs';
import crypto from 'crypto';

/**
 * Password utility functions for secure password handling
 */

// Password complexity requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  const salt = await genSalt(saltRounds);
  return hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and error messages
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
} {
  const errors: string[] = [];
  let strengthScore = 0;

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  } else {
    strengthScore++;
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    strengthScore++;
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    strengthScore++;
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    strengthScore++;
  }

  // Check for special characters
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    strengthScore++;
  }

  // Additional strength checks
  if (password.length >= 12) strengthScore++;
  if (password.length >= 16) strengthScore++;
  if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
    strengthScore++;
  }

  // Determine strength level
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (strengthScore <= 2) {
    strength = 'weak';
  } else if (strengthScore <= 4) {
    strength = 'medium';
  } else if (strengthScore <= 6) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Generate a secure random password
 * @param length - Length of the password (default: 16)
 * @returns Generated password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + specialChars;
  
  let password = '';
  
  // Ensure at least one character from each required set
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Generate a secure token for password reset or email verification
 * @returns Secure random token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a numeric OTP (One-Time Password)
 * @param length - Length of the OTP (default: 6)
 * @returns Numeric OTP
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
}

/**
 * Hash a token for storage (e.g., password reset tokens)
 * @param token - Token to hash
 * @returns Hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Check if a password has been compromised (mock implementation)
 * In production, this would check against a service like HaveIBeenPwned
 * @param password - Password to check
 * @returns True if password is compromised
 */
export async function isPasswordCompromised(password: string): Promise<boolean> {
  // Common weak passwords to check against
  const commonWeakPasswords = [
    'password',
    '123456',
    '123456789',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
  ];
  
  const lowerPassword = password.toLowerCase();
  return commonWeakPasswords.some(weakPass => lowerPassword.includes(weakPass));
}

/**
 * Calculate password entropy (randomness)
 * @param password - Password to analyze
 * @returns Entropy in bits
 */
export function calculatePasswordEntropy(password: string): number {
  let charsetSize = 0;
  
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/\d/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
  
  const entropy = password.length * Math.log2(charsetSize);
  return Math.round(entropy * 100) / 100;
}

/**
 * Get password strength feedback message
 * @param strength - Password strength level
 * @returns User-friendly feedback message
 */
export function getPasswordStrengthMessage(
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
): string {
  const messages = {
    weak: 'Weak password. Please choose a stronger password.',
    medium: 'Medium strength. Consider adding more complexity.',
    strong: 'Strong password. Good choice!',
    'very-strong': 'Very strong password. Excellent choice!',
  };
  
  return messages[strength];
}

/**
 * Generate a pronounceable password (easier to remember)
 * @param syllables - Number of syllables (default: 4)
 * @returns Pronounceable password
 */
export function generatePronouncablePassword(syllables: number = 4): string {
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const vowels = 'aeiou';
  const numbers = '0123456789';
  const specials = '!@#$%';
  
  let password = '';
  
  for (let i = 0; i < syllables; i++) {
    // Add consonant
    password += consonants[Math.floor(Math.random() * consonants.length)];
    // Add vowel
    password += vowels[Math.floor(Math.random() * vowels.length)];
    
    // Sometimes add another consonant
    if (Math.random() > 0.5) {
      password += consonants[Math.floor(Math.random() * consonants.length)];
    }
  }
  
  // Add numbers and special characters for security
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specials[Math.floor(Math.random() * specials.length)];
  
  // Capitalize first letter
  return password.charAt(0).toUpperCase() + password.slice(1);
}