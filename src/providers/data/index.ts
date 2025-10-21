import dataProviderSimpleRest from "@refinedev/simple-rest";
import type { DataProvider } from "@refinedev/core";
import axios from "axios";
import { stringify } from "query-string";

// Use environment variable for API URL, fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const API_URL = `${API_BASE_URL}/v1`;

// Create axios instance with credentials included for cookie-based auth
const axiosInstance = axios.create({
  withCredentials: true, // Important: include cookies for JWT auth
});

// Add request interceptor to include org-id header
axiosInstance.interceptors.request.use((config) => {
  // Add x-org-id header from localStorage
  const orgId = localStorage.getItem('org_id');
  if (orgId) {
    config.headers['x-org-id'] = orgId;
  }

  return config;
});

// Add response interceptor to transform paginated responses and handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    // If response has 'items' field (paginated response), transform it
    if (response.data && response.data.items && Array.isArray(response.data.items)) {
      // Keep the original structure but also add 'data' field for compatibility
      response.data.data = response.data.items;
    }
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 422) {
      const errorDetail = error.response?.data?.detail || "";

      if (errorDetail.includes("Missing token in request")) {
        // Create a standardized error object that matches what the auth provider expects
        const authError = {
          status: 422,
          statusCode: 422,
          message: "Missing token in request.",
          detail: "Missing token in request.",
          name: "AuthenticationError"
        };

        // Reject with the standardized error - this will be caught by Refine's error handling
        return Promise.reject(authError);
      }
    }

    // Handle other 401 errors as before
    if (error.response?.status === 401) {
      const authError = {
        status: 401,
        statusCode: 401,
        message: error.response?.data?.detail || "Unauthorized",
        name: "AuthenticationError"
      };
      return Promise.reject(authError);
    }

    // For all other errors, pass through as-is
    return Promise.reject(error);
  }
);

// Get the base simple-rest data provider
const simpleRestProvider = dataProviderSimpleRest(API_URL, axiosInstance);

// Customize the data provider to use page/page_size instead of _start/_end
export const dataProvider: DataProvider = {
  ...simpleRestProvider,
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${API_URL}/${resource}`;

    // Handle pagination - Refine uses current/pageSize
    const current = (pagination as any)?.current ?? 1;
    const pageSize = (pagination as any)?.pageSize ?? 10;
    const mode = (pagination as any)?.mode ?? "server";

    const query: {
      page?: number;
      page_size?: number;
      q?: string;
    } = {};

    if (mode === "server") {
      query.page = current;
      query.page_size = pageSize;
    }

    // Handle search filter (q parameter)
    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter && filter.field === "q" && filter.value) {
          query.q = filter.value;
        }
      });
    }

    const { data } = await axiosInstance.get(
      `${url}?${stringify(query, { skipNull: true, skipEmptyString: true })}`
    );

    return {
      data: data.items || data.data || data,
      total: data.total || data.items?.length || 0,
    };
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
