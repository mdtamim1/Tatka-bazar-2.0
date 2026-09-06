import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Tatka Bazar",
  description: "Reset your Tatka Bazar account password with secure OTP verification.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
