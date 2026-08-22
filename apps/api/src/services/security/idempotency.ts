// =============================================================================
// Tatka Bazar — Financial Transaction Idempotency Engine
// Prevents duplicate charges if user double-clicks "Pay Now" or network retries
// =============================================================================

interface IdempotencyRecord {
  response: any;
  createdAt: number;
  inFlight: boolean;
}

const IDEMPOTENCY_TTL_MS = 2 * 60 * 1000; // 2 minutes lock window

class IdempotencyManager {
  private store = new Map<string, IdempotencyRecord>();

  /**
   * Check if a transaction with this key is already processed or in-flight
   */
  check(key: string): { inFlight: boolean; cachedResponse?: any } | null {
    const record = this.store.get(key);
    if (!record) return null;

    if (Date.now() - record.createdAt > IDEMPOTENCY_TTL_MS) {
      this.store.delete(key);
      return null;
    }

    if (record.inFlight) {
      return { inFlight: true };
    }

    return { inFlight: false, cachedResponse: record.response };
  }

  /**
   * Lock key while processing
   */
  start(key: string): void {
    this.store.set(key, {
      response: null,
      createdAt: Date.now(),
      inFlight: true,
    });
  }

  /**
   * Store completed response
   */
  complete(key: string, response: any): void {
    this.store.set(key, {
      response,
      createdAt: Date.now(),
      inFlight: false,
    });
  }

  /**
   * Release key on failure to allow retry
   */
  release(key: string): void {
    this.store.delete(key);
  }
}

export const idempotencyGuard = new IdempotencyManager();
