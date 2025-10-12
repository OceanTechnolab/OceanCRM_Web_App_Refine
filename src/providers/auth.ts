import type { AuthProvider } from "@refinedev/core";

import { API_BASE_URL } from "./data";

/**
 * For demo purposes and to make it easier to test the app, you can use the following credentials:
 */
export const authCredentials = {
  email: "",
  password: "",
};

/**
 * Get CSRF token from cookie or localStorage
 */
const getCsrfToken = (): string | null => {
  // First try to get from localStorage (set after login for cross-origin scenarios)
  const storedToken = localStorage.getItem('csrf_access_token');
  if (storedToken) {
    return storedToken;
  }

  // Fallback to reading from cookies (works in same-origin scenarios)
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_access_token') {
      return value;
    }
  }
  return null;
};

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: allows cookies to be set
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: {
            message: error.detail || "Login failed",
            name: "LoginError",
          },
        };
      }

      // After successful login, try to read CSRF token from cookie and store in localStorage
      // This helps with cross-origin scenarios where JavaScript might not be able to read cookies
      console.log("[LOGIN] All cookies:", document.cookie || "(empty)");
      const cookies = document.cookie.split(';');
      let csrfTokenFound = false;
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf_access_token' && value) {
          console.log("[LOGIN] ✅ Found CSRF token in cookie, storing in localStorage");
          localStorage.setItem('csrf_access_token', value);
          csrfTokenFound = true;
          break;
        }
      }

      if (!csrfTokenFound) {
        console.warn("[LOGIN] ⚠️ CSRF token NOT readable in JavaScript (cross-origin issue)");
        console.log("[LOGIN] But the browser HAS the cookie and will send it automatically");
        console.log("[LOGIN] Making test request to verify cookies work...");

        // The cookies exist (login succeeded) but JS can't read them
        // Make a test request - browser will send cookies automatically
        const testResponse = await fetch(`${API_BASE_URL}/v1/user/logged`, {
          method: "GET",
          credentials: "include",
          // No X-CSRF-Token header - let's see if the API sends it without it
        });

        console.log("[LOGIN] Test request status:", testResponse.status);

        if (testResponse.ok) {
          console.log("[LOGIN] ✅ Cookies are working! Storing placeholder in localStorage");
          // Store a placeholder so check() knows cookies exist
          localStorage.setItem('csrf_access_token', 'CROSS_ORIGIN_COOKIE');
        } else {
          console.error("[LOGIN] ❌ Test request failed:", testResponse.status);
        }
      }

      // Fetch the user's organizations to get org_id
      const csrfToken = getCsrfToken();
      console.log("[LOGIN] CSRF token for org request:", csrfToken);

      const orgResponse = await fetch(`${API_BASE_URL}/v1/org/current`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Browser will send cookies automatically, don't send X-CSRF-Token if we have placeholder
        },
        credentials: "include",
      });

      console.log("[LOGIN] Org response status:", orgResponse.status);

      if (orgResponse.ok) {
        const orgs = await orgResponse.json();
        console.log("[LOGIN] Organizations received:", orgs);
        if (orgs && orgs.length > 0) {
          // Store the first org_id in localStorage
          localStorage.setItem("org_id", orgs[0].id);
          console.log("[LOGIN] Org ID stored:", orgs[0].id);
        }
      }

      // Cookies are automatically stored by the browser
      // Use "/" because Vite's base config already handles the base path
      const redirectPath = "/";

      console.log("[LOGIN] ✅ Login successful, redirecting to:", redirectPath);
      console.log("[LOGIN] localStorage csrf_access_token:", localStorage.getItem('csrf_access_token'));
      console.log("[LOGIN] localStorage org_id:", localStorage.getItem('org_id'));

      return {
        success: true,
        redirectTo: redirectPath,
      };
    } catch (e) {
      const error = e as Error;

      return {
        success: false,
        error: {
          message: "message" in error ? error.message : "Login failed",
          name: "name" in error ? error.name : "Network error",
        },
      };
    }
  },
  logout: async () => {
    try {
      const csrfToken = getCsrfToken();
      await fetch(`${API_BASE_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? {
          "X-CSRF-Token": csrfToken,
        } : {},
      });
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout error:", error);
    }

    // Clear stored data
    localStorage.removeItem("org_id");
    localStorage.removeItem("csrf_access_token");

    // Use "/login" because Vite's base config already handles the base path
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    if (error.statusCode === 401 || error.status === 401) {
      return {
        logout: true,
        error,
      };
    }

    return { error };
  },
  check: async () => {
    try {
      // Use "/login" because Vite's base config already handles the base path
      const loginPath = "/login";

      console.log("[CHECK] Starting auth check...");
      console.log("[CHECK] Current path:", window.location.pathname);

      // Try to get CSRF token from localStorage or cookies
      const csrfToken = getCsrfToken();
      console.log("[CHECK] CSRF token:", csrfToken ? (csrfToken === 'CROSS_ORIGIN_COOKIE' ? "PLACEHOLDER" : "ACTUAL") : "MISSING");

      // If no CSRF token (not even placeholder), we're not authenticated
      if (!csrfToken) {
        console.log("[CHECK] ❌ No CSRF token, not authenticated");
        // Clear any stale data
        localStorage.removeItem('org_id');
        return {
          authenticated: false,
          redirectTo: loginPath,
        };
      }

      // We have a CSRF token (or placeholder), verify with the API
      // Make a request to check if user is authenticated
      // The cookies will be sent automatically with credentials: "include"
      console.log("[CHECK] Verifying with API /v1/user/logged...");

      // Only send X-CSRF-Token header if we have the actual token value
      const headers: HeadersInit = {};
      if (csrfToken && csrfToken !== 'CROSS_ORIGIN_COOKIE') {
        headers["X-CSRF-Token"] = csrfToken;
        console.log("[CHECK] Using actual CSRF token in header");
      } else {
        console.log("[CHECK] Using cookies only (no CSRF header - cross-origin mode)");
      }

      const response = await fetch(`${API_BASE_URL}/v1/user/logged`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      console.log("[CHECK] API response status:", response.status);

      if (response.ok) {
        console.log("[CHECK] ✅ User is authenticated");
        return {
          authenticated: true,
        };
      }

      // If response is 401, clear any stored tokens
      if (response.status === 401) {
        console.log("[CHECK] ❌ 401 Unauthorized - clearing tokens");
        localStorage.removeItem('csrf_access_token');
        localStorage.removeItem('org_id');
      }

      console.log("[CHECK] ❌ Not authenticated, redirecting to login");
      return {
        authenticated: false,
        redirectTo: loginPath,
      };
    } catch (error) {
      console.error("[CHECK] ❌ Exception:", error);
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },
  getIdentity: async () => {
    try {
      // Check if user has authentication cookie before making request
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        // No CSRF token means user is not authenticated
        return null;
      }

      // Only send X-CSRF-Token header if we have the actual token value
      const headers: HeadersInit = {};
      if (csrfToken && csrfToken !== 'CROSS_ORIGIN_COOKIE') {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const response = await fetch(`${API_BASE_URL}/v1/user/logged`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Map FastAPI user response to expected format
      return {
        id: data.id,
        name: data.name || data.email,
        email: data.email,
        mobile: data.mobile,
        avatarUrl: data.avatar_url,
      };
    } catch (error) {
      return null;
    }
  },
};
