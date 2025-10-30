import { useList, useCreate, useUpdate, useInvalidate } from "@refinedev/core";
import type { CrudFilters, CrudSorting, Pagination } from "@refinedev/core";

// Lead type based on your existing structure
export interface Lead {
  id: string;
  since: string;
  stage: string;
  tags: string[];
  requirements: string;
  notes: string;
  potential: number;
  business: {
    id: string;
    business: string;
    name: string;
    title?: string;
    designation?: string;
    mobile: string;
    email: string;
    website?: string;
    address_line_1?: string;
    address_line_2?: string;
    country?: string;
    city?: string;
    gstin?: string;
    code?: string;
  };
  product?: {
    id: number;
    name: string;
  };
  source?: {
    id: number;
    name: string;
    is_default?: boolean;
  };
  assigned_user?: {
    id: string;
    name: string;
  };
}

export interface CreateLeadPayload {
  stage: string;
  title?: string;
  since: string;
  country?: string;
  assigned_user_id?: string;
  source_id?: number;
  product_id?: number;
  potential?: number;
  tags?: string[];
  requirements?: string;
  notes?: string;
  business: {
    business: string;
    name: string;
    title?: string;
    designation?: string;
    mobile: string;
    email: string;
    website?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    country?: string;
    gstin?: string;
    code?: string;
  };
}

export interface UpdateLeadPayload {
  stage?: string;
  requirements?: string;
  notes?: string;
  assigned_to?: string;
  tags?: string[];
  source_id?: number;
  product_id?: number;
  potential?: number;
  business?: {
    id: string;
    business: string;
    name: string;
    title?: string | null;
    designation?: string;
    mobile: string;
    email: string;
    website?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    country?: string;
    gstin?: string;
    code?: string;
  };
  since?: string;
}

/**
 * Custom hook to fetch all leads with optional filters, sorting, and pagination
 * Benefits:
 * - Automatic caching and deduplication
 * - Automatic error handling via authProvider.onError
 * - Loading and error states
 * - Supports filters, sorting, and pagination
 */
export const useLeads = (options?: {
  filters?: CrudFilters;
  sorters?: CrudSorting;
  pagination?: Pagination;
  queryOptions?: {
    enabled?: boolean;
    staleTime?: number;
  };
}) => {
  return useList<Lead>({
    resource: "lead",
    filters: options?.filters,
    sorters: options?.sorters || [
      {
        field: "since",
        order: "desc",
      },
    ],
    pagination: options?.pagination,
    queryOptions: {
      staleTime: options?.queryOptions?.staleTime ?? 30 * 1000, // 30 seconds default
      enabled: options?.queryOptions?.enabled ?? true,
    },
  });
};

/**
 * Custom hook to fetch leads by stage
 * Useful for Kanban boards or filtered views
 */
export const useLeadsByStage = (stage: string | undefined) => {
  return useList<Lead>({
    resource: "lead",
    filters: stage
      ? [
          {
            field: "stage",
            operator: "eq",
            value: stage,
          },
        ]
      : undefined,
    sorters: [
      {
        field: "since",
        order: "desc",
      },
    ],
    queryOptions: {
      enabled: !!stage,
      staleTime: 30 * 1000,
    },
  });
};

/**
 * Custom hook to fetch leads by assigned user
 * Useful for user-specific lead views
 */
export const useLeadsByAssignedUser = (userId: string | undefined) => {
  return useList<Lead>({
    resource: "lead",
    filters: userId
      ? [
          {
            field: "assigned_user.id",
            operator: "eq",
            value: userId,
          },
        ]
      : undefined,
    sorters: [
      {
        field: "since",
        order: "desc",
      },
    ],
    queryOptions: {
      enabled: !!userId,
      staleTime: 30 * 1000,
    },
  });
};

/**
 * Custom hook to create a lead using Refine's data hooks
 * Benefits:
 * - Automatic cache invalidation
 * - Optimistic updates support
 * - Automatic error handling
 * - Success/error notifications
 */
export const useCreateLead = () => {
  const invalidate = useInvalidate();

  return useCreate<Lead, any, CreateLeadPayload>({
    resource: "lead",
    successNotification: (data) => ({
      message: "Lead created successfully",
      type: "success",
      description: `Lead for ${
        data?.data?.business?.business || "business"
      } has been created`,
    }),
    errorNotification: (error) => ({
      message: error?.message || "Failed to create lead",
      type: "error",
      description: "Please check the form and try again",
    }),
    meta: {
      onSuccess: () => {
        // Invalidate lead list cache to refetch
        invalidate({
          resource: "lead",
          invalidates: ["list"],
        });
      },
    },
  });
};

/**
 * Custom hook to update a lead using Refine's data hooks
 * Benefits:
 * - Automatic cache invalidation
 * - Optimistic updates support
 * - Automatic error handling
 * - Success/error notifications
 */
export const useUpdateLead = () => {
  const invalidate = useInvalidate();

  return useUpdate<Lead, any, UpdateLeadPayload>({
    resource: "lead",
    mutationMode: "optimistic", // UI updates instantly
    successNotification: (data) => ({
      message: "Lead updated successfully",
      type: "success",
    }),
    errorNotification: (error) => ({
      message: error?.message || "Failed to update lead",
      type: "error",
    }),
    meta: {
      onSuccess: () => {
        // Invalidate lead list cache to refetch
        invalidate({
          resource: "lead",
          invalidates: ["list", "detail"],
        });
      },
    },
  });
};

/**
 * Custom hook to search leads by multiple fields
 * Supports searching by business name, email, mobile
 */
export const useSearchLeads = (searchTerm: string | undefined) => {
  return useList<Lead>({
    resource: "lead",
    filters: searchTerm
      ? [
          {
            operator: "or",
            value: [
              {
                field: "business.business",
                operator: "contains",
                value: searchTerm,
              },
              {
                field: "business.email",
                operator: "contains",
                value: searchTerm,
              },
              {
                field: "business.mobile",
                operator: "contains",
                value: searchTerm,
              },
            ],
          },
        ]
      : undefined,
    pagination: {
      pageSize: 50,
      mode: "server",
    },
    queryOptions: {
      enabled: !!searchTerm && searchTerm.length > 2,
      staleTime: 15 * 1000, // 15 seconds for search results
    },
  });
};
