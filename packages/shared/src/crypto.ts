import crypto from "crypto";

// ============================================================
// Tatka Bazar — Enterprise PII Cryptography & Data Protection
// AES-256-GCM Authenticated Encryption for sensitive data at rest
// ============================================================

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Derives a consistent 32-byte (256-bit) key from the environment secret or fallback
 */
function getEncryptionKey(overrideKey?: string): Buffer {
  const secret =
    overrideKey ||
    process.env["PII_ENCRYPTION_KEY"] ||
    process.env["JWT_SECRET"] ||
    "tatka-bazar-pii-secret-key-32-bytes-long!";

  // Hash with SHA-256 to guarantee exact 32 bytes
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt sensitive plain text using AES-256-GCM
 * Output format: `iv_hex:authTag_hex:encrypted_hex`
 */
export function encryptPII(plainText: string, secretKey?: string): string {
  if (!plainText || typeof plainText !== "string") return "";

  const key = getEncryptionKey(secretKey);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM cipher text back to plain text
 */
export function decryptPII(cipherText: string, secretKey?: string): string {
  if (!cipherText || typeof cipherText !== "string") return "";

  // If not in `iv:authTag:content` format, return as-is (graceful fallback for unencrypted legacy data)
  const parts = cipherText.split(":");
  if (parts.length !== 3) {
    return cipherText;
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  if (!ivHex || !authTagHex || !encryptedHex) return cipherText;

  try {
    const key = getEncryptionKey(secretKey);
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    // If decryption or authentication tag check fails, return masked fallback
    return "[ENCRYPTED_DATA_CORRUPTED]";
  }
}

/**
 * Check if a string looks like an AES-256-GCM encrypted payload
 */
export function isPIIEncrypted(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const parts = text.split(":");
  return parts.length === 3 && parts[0]?.length === 24 && parts[1]?.length === 32;
}

/**
 * Mask sensitive data for UI displays and external views
 */
export function maskPII(
  value: string | null | undefined,
  type: "NID" | "PHONE" | "BANK_ACCOUNT" | "BKASH" = "PHONE"
): string {
  if (!value) return "";

  // If encrypted, decrypt first
  const plain = isPIIEncrypted(value) ? decryptPII(value) : value;

  const len = plain.length;
  if (len <= 4) return "****";

  switch (type) {
    case "NID":
      // e.g., 19901234567890 -> 1990*****890
      if (len <= 7) return plain.slice(0, 2) + "*****" + plain.slice(-2);
      return plain.slice(0, 4) + "*".repeat(Math.max(3, len - 7)) + plain.slice(-3);

    case "PHONE":
    case "BKASH":
      // e.g., 01712345678 -> 017*****678
      if (len === 11) return plain.slice(0, 3) + "*****" + plain.slice(-3);
      return plain.slice(0, 3) + "*".repeat(Math.max(3, len - 5)) + plain.slice(-2);

    case "BANK_ACCOUNT":
      // e.g., 1051234567890 -> 105*****890
      return plain.slice(0, 3) + "*".repeat(Math.max(4, len - 7)) + plain.slice(-4);

    default:
      return plain.slice(0, 2) + "*****" + plain.slice(-2);
  }
}
