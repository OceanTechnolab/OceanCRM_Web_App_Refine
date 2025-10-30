import type { AuthProvider } from "@refinedev/core";

import {
  API_BASE_URL,
  axiosInstance,
  resetAuthState,
  markRefineHandledError,
} from "./data";
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
      // Reset authentication state on login attempt
      resetAuthState();

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
    console.log("[LOGOUT] Starting logout process");

    try {
      // Attempt logout API call
      await axiosInstance.post(`${API_BASE_URL}/v1/auth/logout`);
      console.log("[LOGOUT] API call successful");
    } catch (error: any) {
      // Check if this is an authentication-related error (expected if token expired)
      const isAuthError =
        error?.statusCode === 401 ||
        error?.statusCode === 0 ||
        error?.name === "AuthenticationInProgress" ||
        error?.message === "Authentication in progress";

      if (isAuthError) {
        console.log(
          "[LOGOUT] Skipping API call - session already invalid or in auth error state",
        );
      } else {
        console.error("[LOGOUT] API call failed:", error);
      }
    }

    // Always clear organization data regardless of API call result
    console.log("[LOGOUT] Clearing organization data");
    clearOrgData();

    // Reset authentication state so new login attempts work
    resetAuthState();

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    console.log("[AUTH] onError called with:", {
      statusCode: error.statusCode,
      message: error.message,
      detail: error.detail,
      name: error.name,
    });

    // Ignore blocked requests during authentication - they're expected
    if (
      error.name === "AuthenticationInProgress" ||
      error.message === "Authentication in progress"
    ) {
      console.log("[AUTH] Ignoring blocked request during authentication");
      return { error };
    }

    // Handle authentication errors (401 or 422 mapped to 401)
    if (error.statusCode === 401) {
      console.log(
        "[AUTH] ✓ Refine's onError handling authentication error - triggering logout",
      );

      // Mark that Refine successfully handled the error
      // This prevents the fallback timeout from triggering
      markRefineHandledError();

      // Return logout: true to trigger logout method
      // The logout method will handle clearing data and API call
      // According to Refine docs: when logout is true, redirectTo from logout method is used
      return {
        logout: true,
        error: {
          message: error.message || AuthErrorMessages.SESSION_EXPIRED,
          name: "Authentication Error",
        },
      };
    }

    // For all other errors, just return the error without logging out
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
