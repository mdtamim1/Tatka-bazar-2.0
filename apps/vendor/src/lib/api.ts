export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isSuspended?: boolean;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vendor_token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("vendor_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("vendor_token");
  localStorage.removeItem("vendor_user");
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
  localStorage.setItem("vendor_user", typeof user === "string" ? user : JSON.stringify(user));
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
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
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signup")) {
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
