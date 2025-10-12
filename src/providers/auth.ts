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
 * Get the base path for the app (important for GitHub Pages deployment)
 */
const getBasePath = (): string => {
  return import.meta.env.VITE_BASE_PATH || "";
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
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf_access_token' && value) {
          localStorage.setItem('csrf_access_token', value);
          break;
        }
      }

      // Fetch the user's organizations to get org_id
      const csrfToken = getCsrfToken();

      const orgResponse = await fetch(`${API_BASE_URL}/v1/org/current`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        },
        credentials: "include",
      });

      if (orgResponse.ok) {
        const orgs = await orgResponse.json();
        if (orgs && orgs.length > 0) {
          // Store the first org_id in localStorage
          localStorage.setItem("org_id", orgs[0].id);
        }
      }

      // Cookies are automatically stored by the browser
      const basePath = getBasePath();
      const redirectPath = basePath ? `${basePath}/` : "/";

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

    const basePath = getBasePath();
    return {
      success: true,
      redirectTo: basePath ? `${basePath}/login` : "/login",
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
      const basePath = getBasePath();
      const loginPath = basePath ? `${basePath}/login` : "/login";

      // Check if we're already on the login page - if so, don't make unnecessary requests
      const currentPath = window.location.pathname;
      const isOnLoginPage = currentPath === loginPath || currentPath.endsWith('/login');

      // Try to get CSRF token from localStorage or cookies
      const csrfToken = getCsrfToken();

      // If no CSRF token and we're not on login page, we're not authenticated
      if (!csrfToken) {
        if (!isOnLoginPage) {
          // Clear any stale data
          localStorage.removeItem('org_id');
        }
        return {
          authenticated: false,
          redirectTo: loginPath,
        };
      }

      // If we're on the login page with a token, we might be authenticated
      // Make a quick check
      if (isOnLoginPage) {
        return {
          authenticated: false,
          redirectTo: loginPath,
        };
      }

      // Make a request to check if user is authenticated
      // The cookies will be sent automatically with credentials: "include"
      const response = await fetch(`${API_BASE_URL}/v1/user/logged`, {
        method: "GET",
        credentials: "include",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });

      if (response.ok) {
        return {
          authenticated: true,
        };
      }

      // If response is 401, clear any stored tokens
      if (response.status === 401) {
        localStorage.removeItem('csrf_access_token');
        localStorage.removeItem('org_id');
      }

      return {
        authenticated: false,
        redirectTo: loginPath,
      };
    } catch (error) {
      console.error("[AUTH CHECK] Exception:", error);
      const basePath = getBasePath();
      return {
        authenticated: false,
        redirectTo: basePath ? `${basePath}/login` : "/login",
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

      const response = await fetch(`${API_BASE_URL}/v1/user/logged`, {
        method: "GET",
        credentials: "include",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
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
