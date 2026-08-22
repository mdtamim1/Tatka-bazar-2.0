// =============================================================================
// Tatka Bazar — Sensitive Data Privacy & Masking Engine (GDPR & Data Protection)
// Protects Customer Phone Numbers, NIDs, and Emails across API and Vendor screens
// =============================================================================

/**
 * Mask Bangladeshi phone number (e.g., 01700000002 -> 017****0002)
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length < 7) return "***";

  const prefix = cleaned.slice(0, 3); // 017
  const suffix = cleaned.slice(-4);   // 0002
  return `${prefix}****${suffix}`;
}

/**
 * Mask Bangladeshi National ID (NID) (e.g., 19942691234567890 -> 1994********7890)
 */
export function maskNid(nid: string | null | undefined): string {
  if (!nid) return "";
  const cleaned = nid.trim();
  if (cleaned.length < 8) return "********";

  const prefix = cleaned.slice(0, 4);
  const suffix = cleaned.slice(-4);
  const asterisks = "*".repeat(Math.max(4, cleaned.length - 8));
  return `${prefix}${asterisks}${suffix}`;
}

/**
 * Mask Email Address (e.g., customer@tatkabazar.com -> c***r@tatkabazar.com)
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  return `${firstChar}***${lastChar}@${domain}`;
}

/**
 * Mask sensitive user data object for public or vendor view
 */
export function maskCustomerPrivacy(customer: {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  nid?: string;
}) {
  return {
    ...customer,
    phone: maskPhone(customer.phone),
    email: maskEmail(customer.email),
    nid: maskNid(customer.nid),
  };
}
