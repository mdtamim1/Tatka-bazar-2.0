import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Account | Tatka Bazar",
  description: "Verify your email or phone number with the 6-digit security code.",
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
