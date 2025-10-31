import dataProviderSimpleRest from "@refinedev/simple-rest";
import type { DataProvider } from "@refinedev/core";
import axios from "axios";
import { stringify } from "query-string";
import { getOrgId, clearOrgData } from "@/utilities/organization";
import { AuthErrorMessages } from "../auth";

// Use environment variable for API URL, fallback to localhost for development
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const API_URL = `${API_BASE_URL}/v1`;

// Flag to track if we're in authentication error state
let isAuthenticating = false;
let logoutTriggered = false;
let refineHandledError = false;

// Callback to trigger logout from React context
let logoutCallback: (() => void) | null = null;

// Function to set logout callback (called from App.tsx or root component)
export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

// Function to mark that Refine handled the error (called from authProvider.onError)
export const markRefineHandledError = () => {
  refineHandledError = true;
  console.log("[API] Refine successfully handled authentication error");
};

// Function to reset authentication state (called after successful login)
export const resetAuthState = () => {
  isAuthenticating = false;
  logoutTriggered = false;
  refineHandledError = false;
  console.log("[API] Authentication state reset");
};

// Create axios instance with credentials included for cookie-based auth
// Export this instance so other parts of the app can use it for API calls
export const axiosInstance = axios.create({
  withCredentials: true, // Important: include cookies for JWT auth
});

// Add request interceptor to include org-id header and prevent requests during auth errors
axiosInstance.interceptors.request.use(
  (config) => {
    // If we're in authentication error state, block all non-auth API calls
    if (isAuthenticating) {
      const isAuthEndpoint = config.url?.includes("/auth/login");
      if (!isAuthEndpoint) {
        console.log(
          "[API] Blocking request during authentication error:",
          config.url,
        );
        // Cancel the request before it's sent
        const error: any = new Error("Authentication in progress");
        error.code = "AUTH_IN_PROGRESS";
        error.config = config;
        return Promise.reject(error);
      }
    }

    // Add x-org-id header using centralized organization utility
    const orgId = getOrgId();
    if (orgId) {
      config.headers["x-org-id"] = orgId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to transform paginated responses and handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    // If response has 'items' field (paginated response), transform it
    if (response.data?.items && Array.isArray(response.data.items)) {
      // Keep the original structure but also add 'data' field for compatibility
      response.data.data = response.data.items;
    }
    return response;
  },
  (error) => {
    // Centralized error handling for all API calls
    const status = error.response?.status;
    const errorDetail = error.response?.data?.detail || "";

    // Create a base error object that Refine can handle
    const customError: any = new Error(errorDetail || error.message);
    customError.statusCode = status;
    customError.detail = errorDetail;

    // Handle different error types with user-friendly messages
    if (!error.response) {
      // Check if this is an intentionally blocked request during auth error
      if (
        error.code === "AUTH_IN_PROGRESS" ||
        error.message === "Authentication in progress"
      ) {
        console.log(
          "[API] Blocked request during authentication:",
          error.config?.url,
        );
        customError.statusCode = 0;
        customError.name = "AuthenticationInProgress";
        customError.message = "Authentication in progress";
        return Promise.reject(customError);
      }

      // Real network error (no response from server)
      console.error("[API] Network error:", error.message);
      customError.statusCode = 0;
      customError.message =
        "Network error. Please check your internet connection and try again.";
      return Promise.reject(customError);
    }

    if (status === 401) {
      // Unauthorized - check for exact invalid/expired token error
      console.error("[API] 401 Unauthorized:", errorDetail);

      // Set flag to block further API requests immediately
      if (!isAuthenticating) {
        isAuthenticating = true;
        console.log(
          "[API] Authentication error detected - will block further requests",
        );
        console.log(
          "[API] Giving Refine 500ms to handle error via authProvider.onError...",
        );

        // Give Refine a chance to handle the error first (proper way)
        // If Refine doesn't handle it within 500ms, we'll do it ourselves
        queueMicrotask(() => {
          setTimeout(() => {
            if (!refineHandledError && !logoutTriggered) {
              logoutTriggered = true;
              console.warn(
                "[API] Refine didn't handle error in time - triggering fallback logout",
              );

              // Clear org data
              clearOrgData();

              // Use logout callback if available (React-based navigation)
              // Otherwise fall back to window.location (for safety)
              if (logoutCallback) {
                console.log("[API] Using React-based logout callback");
                logoutCallback();
              } else {
                console.warn(
                  "[API] No logout callback set, using window.location fallback",
                );
                window.location.href = "/login";
              }
            } else if (refineHandledError) {
              console.log(
                "[API] ✓ Refine handled the error successfully - no fallback needed",
              );
            }
          }, 500); // Give Refine 500ms to handle the error
        });
      }

      // Still set up the error properly for Refine hooks to catch it
      customError.message =
        errorDetail || "Session expired. Please log in again.";
      customError.statusCode = 401;

      return Promise.reject(customError);
    }

    if (status === 422) {
      // Unprocessable Entity - check for exact missing token error
      if (errorDetail === AuthErrorMessages.MISSING_TOKEN) {
        console.error("[API] 422 Missing token (exact match)");

        // Set flag to block further API requests immediately
        if (!isAuthenticating) {
          isAuthenticating = true;
          console.log(
            "[API] Authentication error detected - will block further requests",
          );
          console.log(
            "[API] Giving Refine 500ms to handle error via authProvider.onError...",
          );

          // Give Refine a chance to handle the error first (proper way)
          // If Refine doesn't handle it within 500ms, we'll do it ourselves
          queueMicrotask(() => {
            setTimeout(() => {
              if (!refineHandledError && !logoutTriggered) {
                logoutTriggered = true;
                console.warn(
                  "[API] Refine didn't handle error in time - triggering fallback logout",
                );

                // Clear org data
                clearOrgData();

                // Use logout callback if available (React-based navigation)
                // Otherwise fall back to window.location (for safety)
                if (logoutCallback) {
                  console.log("[API] Using React-based logout callback");
                  logoutCallback();
                } else {
                  console.warn(
                    "[API] No logout callback set, using window.location fallback",
                  );
                  window.location.href = "/login";
                }
              } else if (refineHandledError) {
                console.log(
                  "[API] ✓ Refine handled the error successfully - no fallback needed",
                );
              }
            }, 500); // Give Refine 500ms to handle the error
          });
        }

        // Treat missing token as authentication error (422 → 401 equivalent)
        customError.message = AuthErrorMessages.SESSION_EXPIRED;
        customError.statusCode = 401; // Map to 401 so authProvider.onError handles it

        return Promise.reject(customError);
      }

      // Other 422 errors
      console.error("[API] 422 Validation error:", errorDetail);
      customError.message =
        errorDetail || "Validation error. Please check your input.";
    } else if (status === 403) {
      // Forbidden - no permission
      console.error("[API] 403 Forbidden:", errorDetail);
      customError.message =
        errorDetail || "You don't have permission to perform this action.";
    } else if (status === 404) {
      // Not Found
      console.error("[API] 404 Not Found:", errorDetail);
      customError.message =
        errorDetail || "The requested resource was not found.";
    } else if (status === 409) {
      // Conflict - duplicate or constraint violation
      console.error("[API] 409 Conflict:", errorDetail);
      customError.message =
        errorDetail || "This operation conflicts with existing data.";
    } else if (status === 500) {
      // Internal Server Error
      console.error("[API] 500 Server error:", errorDetail);
      customError.message =
        errorDetail ||
        "Internal server error. Please try again later or contact support.";
    } else if (status === 503) {
      // Service Unavailable
      console.error("[API] 503 Service Unavailable:", errorDetail);
      customError.message =
        "Service temporarily unavailable. Please try again in a moment.";
    } else if (status >= 400 && status < 500) {
      // Other 4xx errors
      console.error(`[API] ${status} Client error:`, errorDetail);
      customError.message =
        errorDetail ||
        `Request error (${status}). Please check your request and try again.`;
    } else if (status >= 500) {
      // Other 5xx errors
      console.error(`[API] ${status} Server error:`, errorDetail);
      customError.message =
        errorDetail || `Server error (${status}). Please try again later.`;
    } else {
      // Unknown error
      console.error("[API] Unknown error:", error);
      customError.message =
        errorDetail || "An unexpected error occurred. Please try again.";
    }

    // Reject with the standardized error so Refine can handle it
    return Promise.reject(customError);
  },
);

// Get the base simple-rest data provider
const simpleRestProvider = dataProviderSimpleRest(API_URL, axiosInstance);

// Customize the data provider to use page/page_size instead of _start/_end
export const dataProvider: DataProvider = {
  ...simpleRestProvider,
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    try {
      const url = `${API_URL}/${resource}`;

      // Handle pagination - Refine uses currentPage/pageSize (not current/pageSize)
      const currentPage =
        (pagination as any)?.currentPage ?? (pagination as any)?.current ?? 1;
      const pageSize = (pagination as any)?.pageSize ?? 10;
      const mode = (pagination as any)?.mode ?? "server";

      const query: {
        page?: number;
        page_size?: number;
        q?: string;
        assigned_user_id?: string;
        lead_id?: string;
        business_id?: string;
      } = {};

      if (mode === "server") {
        query.page = currentPage;
        query.page_size = pageSize;
      }

      // Handle filters
      if (filters) {
        filters.forEach((filter) => {
          if ("field" in filter && filter.value) {
            // Handle search filter (q parameter)
            if (filter.field === "q") {
              query.q = filter.value;
            }
            // Handle assigned_user filter
            else if (
              filter.field === "assigned_user" ||
              filter.field === "assigned_user.id"
            ) {
              // If multiple values, join them with comma
              if (Array.isArray(filter.value)) {
                query.assigned_user_id = filter.value.join(",");
              } else {
                query.assigned_user_id = filter.value;
              }
            }
            // Handle lead_id filter for interactions and appointments
            else if (filter.field === "lead_id") {
              query.lead_id = filter.value;
            }
            // Handle business_id filter for contacts
            else if (filter.field === "business_id") {
              query.business_id = filter.value;
            }
          }
        });
      }

      const { data } = await axiosInstance.get(
        `${url}?${stringify(query, { skipNull: true, skipEmptyString: true })}`,
      );

      return {
        data: data.items || data.data || data,
        total: data.total || data.items?.length || 0,
      };
    } catch (error: any) {
      // Ensure error is properly formatted for Refine's error handling
      // Log the error so we can see it's being caught
      console.error("[DATA PROVIDER] getList error:", error);

      // Re-throw the error so Refine's useTable/useList can catch it
      // and pass it to authProvider.onError via internal useOnError hook
      throw error;
    }
  },

  getOne: async ({ resource, id }) => {
    try {
      // For resources without a dedicated getOne endpoint, fetch from list and find the item
      // This is a workaround for the backend not having GET /v1/lead/{id} endpoint
      if (resource === "lead") {
        const url = `${API_URL}/${resource}`;

        // Fetch with a large page size to increase chances of finding the lead
        // In production, this should be replaced with a proper backend endpoint
        const { data } = await axiosInstance.get(
          `${url}?${stringify(
            { page: 1, page_size: 1000 },
            { skipNull: true },
          )}`,
        );

        const items = data.items || data.data || data;
        const item = items.find((item: any) => item.id === id);

        if (!item) {
          throw new Error(`${resource} with id ${id} not found`);
        }

        return { data: item };
      }

      // For other resources, use the default behavior
      const url = `${API_URL}/${resource}/${id}`;
      const { data } = await axiosInstance.get(url);
      return { data };
    } catch (error: any) {
      console.error("[DATA PROVIDER] getOne error:", error);
      throw error;
    }
  },

  update: async ({ resource, id, variables }) => {
    try {
      const url = `${API_URL}/${resource}/${id}`;
      const { data } = await axiosInstance.put(url, variables);
      return { data };
    } catch (error: any) {
      console.error("[DATA PROVIDER] update error:", error);
      throw error;
    }
  },
};

export const liveProvider = undefined;
