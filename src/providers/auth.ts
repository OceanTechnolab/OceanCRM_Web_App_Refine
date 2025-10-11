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
 * Get CSRF token from cookie
 */
const getCsrfToken = (): string | null => {
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
      return {
        success: true,
        redirectTo: "/",
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

    // Clear stored org_id
    localStorage.removeItem("org_id");

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
      // Check if user has authentication cookie before making request
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        // No CSRF token means user is not authenticated
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }

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

      return {
        authenticated: false,
        redirectTo: "/login",
      };
    } catch (error) {
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
