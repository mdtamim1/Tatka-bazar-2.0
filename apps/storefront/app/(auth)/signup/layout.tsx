import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Tatka Bazar",
  description: "Create an account on Tatka Bazar using your email or mobile number.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
