import type { AuthProvider } from "@refinedev/core";

import { API_BASE_URL } from "./data";

/**
 * For demo purposes and to make it easier to test the app, you can use the following credentials:
 */
export const authCredentials = {
  email: "",
  password: "",
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
      const orgResponse = await fetch(`${API_BASE_URL}/v1/org/current`, {
        method: "GET",
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
      // Use "/" because Vite's base config already handles the base path
      const redirectPath = "/";

      console.log("[LOGIN] ✅ Login successful, redirecting to:", redirectPath);

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
      await fetch(`${API_BASE_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout error:", error);
    }

    // Clear stored data
    localStorage.removeItem("org_id");

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    // Handle 401 Unauthorized - session expired or invalid
    if (error.statusCode === 401 || error.status === 401) {
      console.log("[AUTH] 401 Unauthorized - clearing session and logging out");

      // Clear all auth data immediately
      localStorage.removeItem("org_id");

      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }

    // Handle 422 Unprocessable Content with missing token message
    if (error.statusCode === 422 || error.status === 422) {
      const errorMessage = error.message || error.detail || "";
      
      if (errorMessage.includes("Missing token in request")) {
        console.log("[AUTH] 422 Missing token - clearing session and logging out");

        // Clear all auth data immediately
        localStorage.removeItem("org_id");

        return {
          logout: true,
          redirectTo: "/login",
          error: {
            ...error,
            message: "Your session has expired. Please login again.",
            name: "Session Expired"
          },
        };
      }
    }

    return { error };
  },
  check: async () => {
    try {
      // For same-origin requests, we can simply check if org_id exists
      // The actual authentication will be verified by the server via cookies
      const orgId = localStorage.getItem("org_id");
      
      if (!orgId) {
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }

      // User appears to be authenticated
      // If session expired, onError will catch 401/422 and logout automatically
      return {
        authenticated: true,
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
      // For same-origin requests, simply make the request with credentials
      const response = await fetch(`${API_BASE_URL}/v1/user/logged`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        // Handle 422 specifically to trigger logout via onError
        if (response.status === 422) {
          const errorData = await response.json();
          if (errorData.detail && errorData.detail.includes("Missing token in request")) {
            const error = new Error("Missing token in request.") as any;
            error.status = 422;
            error.statusCode = 422;
            error.detail = "Missing token in request.";
            throw error;
          }
        }
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
