export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isSuspended?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Token Helpers
// Tokens are stored in both:
//   1. localStorage  — for client-side reads (JS)
//   2. document.cookie — for server-side middleware reads (Edge)
// ─────────────────────────────────────────────────────────────────

const COOKIE_NAME = "vendor_token";
const COOKIE_OPTIONS = "path=/; SameSite=Lax; max-age=604800"; // 7 days, match JWT expiry

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vendor_token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("vendor_token", token);
  // 🔒 Also set as cookie so Next.js middleware can read it server-side
  // Use Secure flag on HTTPS (production)
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${COOKIE_NAME}=${token}; ${COOKIE_OPTIONS}${isSecure ? "; Secure" : ""}`;
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("vendor_token");
  localStorage.removeItem("vendor_user");
  // Also clear the cookie
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem("vendor_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    "vendor_user",
    typeof user === "string" ? user : JSON.stringify(user)
  );
}

// ─────────────────────────────────────────────────────────────────
// Authenticated Fetch Wrapper
// ─────────────────────────────────────────────────────────────────

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 401) {
      clearToken();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup")
      ) {
        window.location.href = "/login";
      }
      return {
        success: false,
        error: json.error || "সেশনের মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।",
      };
    }

    if (!res.ok) {
      return {
        success: false,
        error: json.error || `সার্ভার এরর: ${res.status}`,
        isSuspended: json.isSuspended,
      };
    }

    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "নেটওয়ার্ক সংযোগে সমস্যা হয়েছে।",
    };
  }
}
