// Frontend-only OTP service — no backend call needed
// OTP is generated, stored, and verified entirely in the browser session.

interface OtpRecord {
  otp: string;
  expiresAt: number; // ms timestamp
}

const OTP_STORE: Map<string, OtpRecord> = new Map();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function generateOtp(email: string): string {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  OTP_STORE.set(email.toLowerCase().trim(), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
  return otp;
}

export function verifyOtp(
  email: string,
  enteredOtp: string,
): { valid: boolean; expired: boolean } {
  const record = OTP_STORE.get(email.toLowerCase().trim());
  if (!record) return { valid: false, expired: false };
  if (Date.now() > record.expiresAt) {
    OTP_STORE.delete(email.toLowerCase().trim());
    return { valid: false, expired: true };
  }
  if (record.otp === enteredOtp.trim()) {
    OTP_STORE.delete(email.toLowerCase().trim());
    return { valid: true, expired: false };
  }
  return { valid: false, expired: false };
}
