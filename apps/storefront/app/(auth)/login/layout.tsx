import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Tatka Bazar",
  description: "Sign in to your Tatka Bazar account to shop and track your orders.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
