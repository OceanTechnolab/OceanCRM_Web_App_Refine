import type { AuthProvider } from "@refinedev/core";

import { API_BASE_URL, axiosInstance } from "./data";
import { setOrgList, clearOrgData, getOrgId } from "@/utilities/organization";

/**
 * Authentication error messages enum
 */
export enum AuthErrorMessages {
  MISSING_TOKEN = "Missing token in request.",
  INVALID_TOKEN = "Invalid or expired token.",
  SESSION_EXPIRED = "Your session has expired. Please login again.",
}

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
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/auth/login`,
        {
          email,
          password,
        },
      );

      // Fetch the user's organizations
      try {
        const orgResponse = await axiosInstance.get(
          `${API_BASE_URL}/v1/org/current`,
        );

        if (orgResponse.data && orgResponse.data.length > 0) {
          // Store all organizations and set the first one as current
          setOrgList(orgResponse.data);
          console.log(
            "[LOGIN] Loaded",
            orgResponse.data.length,
            "organization(s)",
          );
        }
      } catch (orgError) {
        console.error("[LOGIN] Failed to fetch organizations:", orgError);
      }

      // Cookies are automatically stored by the browser
      // Use "/" because Vite's base config already handles the base path
      const redirectPath = "/";

      console.log("[LOGIN] ✅ Login successful, redirecting to:", redirectPath);

      return {
        success: true,
        redirectTo: redirectPath,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.detail || error.message || "Login failed",
          name: error.name || "LoginError",
        },
      };
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/v1/auth/logout`);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout error:", error);
    }

    // Clear all organization data using centralized utility
    clearOrgData();

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    // Handle 401 Unauthorized with exact invalid/expired token message
    if (error.statusCode === 401 || error.status === 401) {
      const errorDetail = error.detail || "";

      // Check for exact match with invalid/expired token error
      if (errorDetail === AuthErrorMessages.INVALID_TOKEN) {
        console.log(
          "[AUTH] 401 Invalid/expired token (exact match) - clearing session and logging out",
        );

        // Clear all organization data
        clearOrgData();

        return {
          logout: true,
          redirectTo: "/login",
          error: {
            ...error,
            message: AuthErrorMessages.SESSION_EXPIRED,
            name: "Session Expired",
          },
        };
      }

      // Fallback for other 401 errors
      console.log("[AUTH] 401 Unauthorized - clearing session and logging out");

      // Clear all organization data
      clearOrgData();

      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }

    // Handle 422 Unprocessable Content with exact missing token message
    if (error.statusCode === 422 || error.status === 422) {
      const errorDetail = error.detail || "";

      // Check for exact match with the missing token error message
      if (errorDetail === AuthErrorMessages.MISSING_TOKEN) {
        console.log(
          "[AUTH] 422 Missing token (exact match) - clearing session and logging out",
        );

        // Clear all organization data
        clearOrgData();

        return {
          logout: true,
          redirectTo: "/login",
          error: {
            ...error,
            message: AuthErrorMessages.SESSION_EXPIRED,
            name: "Session Expired",
          },
        };
      }
    }

    return { error };
  },
  check: async () => {
    try {
      // Check if org_id exists using centralized utility
      const orgId = getOrgId();

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
      // Check if org_id exists before making the request
      const orgId = getOrgId();

      if (!orgId) {
        console.log("[AUTH] No org_id found, skipping getIdentity");
        return null;
      }

      const response = await axiosInstance.get(
        `${API_BASE_URL}/v1/user/logged`,
      );

      // Map FastAPI user response to expected format
      return {
        id: response.data.id,
        name: response.data.name || response.data.email,
        email: response.data.email,
        mobile: response.data.mobile,
        avatarUrl: response.data.avatar_url,
      };
    } catch (error) {
      return null;
    }
  },
};
