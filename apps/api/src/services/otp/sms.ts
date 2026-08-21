// =============================================================================
// Tatka Bazar — Bangladeshi SMS OTP Engine (Greenweb / MimSMS / Firebase Mock)
// Supports +88017, +88018, +88019, +88013, +88014, +88016, +88015
// =============================================================================

// In-memory OTP storage with 5 minutes expiry
interface OtpEntry {
  phone: string;
  otp: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();

/**
 * 1. Generate and Send SMS OTP
 */
export async function sendSmsOtp(phone: string) {
  // Normalize Bangladeshi phone number
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone.replace(/^0/, "")}`;

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  otpStore.set(cleanPhone, { phone: cleanPhone, otp, expiresAt });

  const smsText = `তাতকা বাজার (Tatka Bazar): আপনার লগইন ভেরিফিকেশন কোড (OTP) হলো ${otp}। এটি ৫ মিনিট কার্যকর থাকবে। কাউকে বলবেন না।`;

  // Log in server console for instant developer verification
  console.log(`\n======================================================`);
  console.log(`📲 [SMS GATEWAY DISPATCH] -> To: +${formattedPhone}`);
  console.log(`💬 Message: "${smsText}"`);
  console.log(`🔑 Verification OTP Code: >>> ${otp} <<< (Or test code: 123456)`);
  console.log(`======================================================\n`);

  return {
    success: true,
    message: "OTP sent successfully to your mobile number",
    phone: formattedPhone,
    expiresIn: 300,
    devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
  };
}

/**
 * 2. Verify SMS OTP
 */
export async function verifySmsOtp(phone: string, inputOtp: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, "");

  // Universal sandbox test OTP
  if (inputOtp === "123456") {
    return { success: true, message: "OTP verified successfully (Sandbox Override)" };
  }

  const record = otpStore.get(cleanPhone);
  if (!record) {
    return { success: false, error: "OTP not requested or has expired" };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanPhone);
    return { success: false, error: "OTP has expired. Please request a new code" };
  }

  if (record.otp !== inputOtp.trim()) {
    return { success: false, error: "Invalid OTP code. Please check and try again" };
  }

  // Clear consumed OTP
  otpStore.delete(cleanPhone);
  return { success: true, message: "OTP verified successfully" };
}
