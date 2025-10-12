import dataProviderSimpleRest from "@refinedev/simple-rest";
import type { DataProvider } from "@refinedev/core";
import axios from "axios";
import { stringify } from "query-string";

// Use environment variable for API URL, fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const API_URL = `${API_BASE_URL}/v1`;

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

// Create axios instance with credentials included for cookie-based auth
const axiosInstance = axios.create({
  withCredentials: true, // Important: include cookies for JWT auth
});

// Add request interceptor to include CSRF token in all requests
axiosInstance.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  // Add x-org-id header from localStorage
  const orgId = localStorage.getItem('org_id');
  if (orgId) {
    config.headers['x-org-id'] = orgId;
  }

  return config;
});

// Add response interceptor to transform paginated responses
axiosInstance.interceptors.response.use((response) => {
  // Store CSRF token from response header if present (from refresh endpoint)
  const csrfToken = response.headers['x-csrf-token'];
  if (csrfToken) {
    localStorage.setItem('csrf_access_token', csrfToken);
  }

  // If response has 'items' field (paginated response), transform it
  if (response.data && response.data.items && Array.isArray(response.data.items)) {
    // Keep the original structure but also add 'data' field for compatibility
    response.data.data = response.data.items;
  }
  return response;
});

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
