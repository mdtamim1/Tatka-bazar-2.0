// =============================================================================
// Tatka Bazar — Brute-Force & Account Lockout Guard
// Locks accounts for 10 minutes after 5 consecutive failed login / OTP attempts
// =============================================================================

interface AttemptRecord {
  failedCount: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes

class BruteForceManager {
  private attempts = new Map<string, AttemptRecord>();

  /**
   * Check if identifier is currently locked out
   */
  isLocked(identifier: string): { locked: boolean; remainingMinutes?: number } {
    const record = this.attempts.get(identifier.toLowerCase());
    if (!record || !record.lockedUntil) {
      return { locked: false };
    }

    if (Date.now() > record.lockedUntil) {
      // Lock expired, reset
      this.attempts.delete(identifier.toLowerCase());
      return { locked: false };
    }

    const remainingMs = record.lockedUntil - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return { locked: true, remainingMinutes };
  }

  /**
   * Record a failed attempt. If count >= 5, lock for 10 minutes.
   */
  recordFailedAttempt(identifier: string): { locked: boolean; attemptsLeft: number; remainingMinutes?: number } {
    const key = identifier.toLowerCase();
    const existing = this.attempts.get(key) || { failedCount: 0, lockedUntil: null, lastAttempt: Date.now() };

    existing.failedCount += 1;
    existing.lastAttempt = Date.now();

    if (existing.failedCount >= MAX_FAILED_ATTEMPTS) {
      existing.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      this.attempts.set(key, existing);
      return { locked: true, attemptsLeft: 0, remainingMinutes: 10 };
    }

    this.attempts.set(key, existing);
    return { locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS - existing.failedCount };
  }

  /**
   * Reset attempts on successful login
   */
  recordSuccess(identifier: string): void {
    this.attempts.delete(identifier.toLowerCase());
  }
}

export const bruteForceGuard = new BruteForceManager();
