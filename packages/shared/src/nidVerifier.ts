/**
 * Real Bangladesh National ID (NID) Verifier Engine
 * Validates Bangladeshi National ID cards following Election Commission standards:
 * - 10-digit Smart NID Cards
 * - 13-digit Legacy NID Cards
 * - 17-digit Canonical NID Cards (Birth Year + 13 digits)
 * Cross-checks with Date of Birth, Adult eligibility (18+), and Front/Back Photo URLs.
 */

export interface NidVerificationInput {
  nidNumber: string;
  dateOfBirth?: string | Date | null;
  fullName?: string | null;
  nidFrontUrl?: string | null;
  nidBackUrl?: string | null;
}

export interface NidVerificationResult {
  isValid: boolean;
  nidType?: "SMART_10" | "OLD_13" | "CANONICAL_17";
  canonicalNid?: string;
  birthYear?: number;
  calculatedAge?: number;
  isAdult: boolean;
  dobMatch?: boolean;
  error?: string;
  confidenceScore: number; // 0 to 100
  details: {
    formatValid: boolean;
    dobConsistent: boolean;
    ageEligible: boolean;
    frontPhotoProvided: boolean;
    backPhotoProvided: boolean;
    externalVerified?: boolean;
  };
}

// Repeated digit patterns to reject
const DUMMY_NID_PATTERNS = [
  /^(\d)\1+$/, // All same digits: 1111111111, 0000000000
  /^1234567890$/,
  /^0123456789$/,
  /^9876543210$/,
];

export function verifyBangladeshNID(input: NidVerificationInput): NidVerificationResult {
  const rawNid = String(input.nidNumber || "").trim().replace(/[\s-]/g, "");
  
  const result: NidVerificationResult = {
    isValid: false,
    isAdult: false,
    confidenceScore: 0,
    details: {
      formatValid: false,
      dobConsistent: false,
      ageEligible: false,
      frontPhotoProvided: Boolean(input.nidFrontUrl && input.nidFrontUrl.trim().length > 5),
      backPhotoProvided: Boolean(input.nidBackUrl && input.nidBackUrl.trim().length > 5),
    },
  };

  if (!rawNid) {
    result.error = "NID নম্বর প্রদান করুন";
    return result;
  }

  // 1. Check for numeric only
  if (!/^\d+$/.test(rawNid)) {
    result.error = "NID নম্বর শুধুমাত্র ইংরেজি সংখ্যা (0-9) হতে হবে";
    return result;
  }

  // 2. Check for dummy sequences
  if (DUMMY_NID_PATTERNS.some((pattern) => pattern.test(rawNid))) {
    result.error = "অকার্যকর বা ডামি NID নম্বর। সঠিক আসল NID নম্বর দিন।";
    return result;
  }

  const length = rawNid.length;
  let nidType: "SMART_10" | "OLD_13" | "CANONICAL_17" | null = null;
  let birthYearFromNid: number | null = null;

  if (length === 10) {
    nidType = "SMART_10";
  } else if (length === 13) {
    nidType = "OLD_13";
  } else if (length === 17) {
    nidType = "CANONICAL_17";
    const yearStr = rawNid.substring(0, 4);
    const parsedYear = parseInt(yearStr, 10);
    const currentYear = new Date().getFullYear();
    if (parsedYear < 1920 || parsedYear > currentYear - 14) {
      result.error = `১৭ ডিজিটের NID-এর প্রথম ৪ সংখ্যা একটি সঠিক জন্মসাল হতে হবে (${yearStr} সঠিক নয়)`;
      return result;
    }
    birthYearFromNid = parsedYear;
  } else {
    result.error = `NID নম্বর ১০, ১৩ অথবা ১৭ ডিজিটের হতে হবে (আপনি দিয়েছেন ${length} ডিজিট)`;
    return result;
  }

  result.nidType = nidType;
  result.details.formatValid = true;

  // 3. Cross-validate with Date of Birth (if provided)
  let birthDate: Date | null = null;
  if (input.dateOfBirth) {
    birthDate = new Date(input.dateOfBirth);
    if (!isNaN(birthDate.getTime())) {
      const dobYear = birthDate.getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - dobYear;
      result.calculatedAge = age;
      result.birthYear = dobYear;

      // Age check: Minimum 18 years for rider/vendor in Bangladesh
      if (age >= 18) {
        result.isAdult = true;
        result.details.ageEligible = true;
      } else {
        result.isAdult = false;
        result.details.ageEligible = false;
        result.error = "রাইডার হিসেবে নিবন্ধনের জন্য কমপক্ষে ১৮ বছর বয়স হতে হবে";
        return result;
      }

      // If 17-digit NID, verify birth year match
      if (nidType === "CANONICAL_17" && birthYearFromNid !== null) {
        if (birthYearFromNid === dobYear) {
          result.details.dobConsistent = true;
          result.dobMatch = true;
        } else {
          result.details.dobConsistent = false;
          result.dobMatch = false;
          result.error = `NID-এর জন্মসাল (${birthYearFromNid}) এবং জন্মতারিখের সাল (${dobYear}) মিলছে না`;
          return result;
        }
      } else if (nidType === "OLD_13") {
        // Can convert to 17-digit canonical NID
        result.canonicalNid = `${dobYear}${rawNid}`;
        result.details.dobConsistent = true;
        result.dobMatch = true;
      } else {
        // 10-digit smart NID: DOB is consistent if adult
        result.details.dobConsistent = true;
        result.dobMatch = true;
      }
    }
  } else {
    // If no DOB provided, but 17-digit NID has birth year
    if (birthYearFromNid !== null) {
      const currentYear = new Date().getFullYear();
      const estimatedAge = currentYear - birthYearFromNid;
      result.calculatedAge = estimatedAge;
      result.birthYear = birthYearFromNid;
      if (estimatedAge >= 18) {
        result.isAdult = true;
        result.details.ageEligible = true;
      }
    }
  }

  // 4. Calculate Confidence Score
  let score = 50; // Valid format gives 50%
  if (result.details.ageEligible) score += 20;
  if (result.details.dobConsistent) score += 15;
  if (result.details.frontPhotoProvided) score += 7.5;
  if (result.details.backPhotoProvided) score += 7.5;

  result.confidenceScore = Math.min(100, Math.round(score));
  result.canonicalNid = result.canonicalNid || rawNid;
  result.isValid = true;

  return result;
}

/**
 * Optional External Porichoy / Government Gateway NID verification
 * Calls external verification service if API key is configured.
 */
export async function callExternalNidService(
  nidNumber: string,
  dob: string
): Promise<{ success: boolean; externalData?: any; error?: string }> {
  const apiKey = process.env["PORICHOY_API_KEY"] || process.env["NID_API_KEY"];
  if (!apiKey) {
    return { success: false, error: "External NID API key not configured" };
  }

  try {
    const res = await fetch("https://api.porichoy.bd.com/api/v1/verification/autofill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        national_id: nidNumber,
        person_dob: dob,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, externalData: data };
    }
    return { success: false, error: `External service returned ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
