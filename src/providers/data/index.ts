import dataProviderSimpleRest from "@refinedev/simple-rest";
import type { DataProvider } from "@refinedev/core";
import axios from "axios";
import { stringify } from "query-string";
import { getOrgId } from "@/utilities/organization";
import { AuthErrorMessages } from "../auth";

// Use environment variable for API URL, fallback to localhost for development
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const API_URL = `${API_BASE_URL}/v1`;

// Create axios instance with credentials included for cookie-based auth
// Export this instance so other parts of the app can use it for API calls
export const axiosInstance = axios.create({
  withCredentials: true, // Important: include cookies for JWT auth
});

// Add request interceptor to include org-id header
axiosInstance.interceptors.request.use((config) => {
  // Add x-org-id header using centralized organization utility
  const orgId = getOrgId();
  if (orgId) {
    config.headers["x-org-id"] = orgId;
  }

  return config;
});

// Add response interceptor to transform paginated responses and handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    // If response has 'items' field (paginated response), transform it
    if (
      response.data &&
      response.data.items &&
      Array.isArray(response.data.items)
    ) {
      // Keep the original structure but also add 'data' field for compatibility
      response.data.data = response.data.items;
    }
    return response;
  },
  (error) => {
    // Centralized error handling for all API calls
    const status = error.response?.status;
    const errorDetail = error.response?.data?.detail || "";

    // Create a base error object
    const baseError = {
      status,
      statusCode: status,
      message: "",
      detail: errorDetail,
      name: "ApiError",
      originalError: error,
    };

    // Handle different error types with user-friendly messages
    if (!error.response) {
      // Network error (no response from server)
      console.error("[API] Network error:", error.message);
      baseError.status = 0;
      baseError.statusCode = 0;
      baseError.message =
        "Network error. Please check your internet connection and try again.";
      baseError.name = "NetworkError";
    } else if (status === 401) {
      // Unauthorized - check for exact invalid/expired token error
      console.error("[API] 401 Unauthorized:", errorDetail);
      if (errorDetail === AuthErrorMessages.INVALID_TOKEN) {
        baseError.message = AuthErrorMessages.SESSION_EXPIRED;
        baseError.name = "AuthenticationError";
      } else {
        baseError.message =
          errorDetail || "Session expired. Please log in again.";
        baseError.name = "AuthenticationError";
      }
    } else if (status === 422) {
      // Unprocessable Entity - check for exact missing token error
      if (errorDetail === AuthErrorMessages.MISSING_TOKEN) {
        console.error("[API] 422 Missing token (exact match)");
        baseError.message = AuthErrorMessages.SESSION_EXPIRED;
        baseError.name = "AuthenticationError";
      } else {
        console.error("[API] 422 Validation error:", errorDetail);
        baseError.message =
          errorDetail || "Validation error. Please check your input.";
        baseError.name = "ValidationError";
      }
    } else if (status === 403) {
      // Forbidden - no permission
      console.error("[API] 403 Forbidden:", errorDetail);
      baseError.message =
        errorDetail || "You don't have permission to perform this action.";
      baseError.name = "PermissionError";
    } else if (status === 404) {
      // Not Found
      console.error("[API] 404 Not Found:", errorDetail);
      baseError.message =
        errorDetail || "The requested resource was not found.";
      baseError.name = "NotFoundError";
    } else if (status === 409) {
      // Conflict - duplicate or constraint violation
      console.error("[API] 409 Conflict:", errorDetail);
      baseError.message =
        errorDetail || "This operation conflicts with existing data.";
      baseError.name = "ConflictError";
    } else if (status === 500) {
      // Internal Server Error
      console.error("[API] 500 Server error:", errorDetail);
      baseError.message =
        errorDetail ||
        "Internal server error. Please try again later or contact support.";
      baseError.name = "ServerError";
    } else if (status === 503) {
      // Service Unavailable
      console.error("[API] 503 Service Unavailable:", errorDetail);
      baseError.message =
        "Service temporarily unavailable. Please try again in a moment.";
      baseError.name = "ServiceUnavailableError";
    } else if (status >= 400 && status < 500) {
      // Other 4xx errors
      console.error(`[API] ${status} Client error:`, errorDetail);
      baseError.message =
        errorDetail ||
        `Request error (${status}). Please check your request and try again.`;
      baseError.name = "ClientError";
    } else if (status >= 500) {
      // Other 5xx errors
      console.error(`[API] ${status} Server error:`, errorDetail);
      baseError.message =
        errorDetail || `Server error (${status}). Please try again later.`;
      baseError.name = "ServerError";
    } else {
      // Unknown error
      console.error("[API] Unknown error:", error);
      baseError.message =
        errorDetail || "An unexpected error occurred. Please try again.";
      baseError.name = "UnknownError";
    }

    // Reject with the standardized error
    return Promise.reject(baseError);
  },
);

// Get the base simple-rest data provider
const simpleRestProvider = dataProviderSimpleRest(API_URL, axiosInstance);

// Customize the data provider to use page/page_size instead of _start/_end
export const dataProvider: DataProvider = {
  ...simpleRestProvider,
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
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
  },

  getOne: async ({ resource, id }) => {
    // For resources without a dedicated getOne endpoint, fetch from list and find the item
    // This is a workaround for the backend not having GET /v1/lead/{id} endpoint
    if (resource === "lead") {
      const url = `${API_URL}/${resource}`;

      // Fetch with a large page size to increase chances of finding the lead
      // In production, this should be replaced with a proper backend endpoint
      const { data } = await axiosInstance.get(
        `${url}?${stringify({ page: 1, page_size: 1000 }, { skipNull: true })}`,
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
  },

  update: async ({ resource, id, variables }) => {
    const url = `${API_URL}/${resource}/${id}`;

    const { data } = await axiosInstance.put(url, variables);

    return {
      data,
    };
  },
};

export const liveProvider = undefined;
