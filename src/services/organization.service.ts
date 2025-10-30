import { useQuery } from "@tanstack/react-query";
import { useApiUrl } from "@refinedev/core";
import axios from "axios";

export interface Organization {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Custom hook to fetch current user's organizations using Refine patterns
 * Endpoint: GET /api/v1/org/current
 *
 * Benefits:
 * - Automatic caching with React Query
 * - Loading and error states
 * - Integrates with Refine's API configuration
 * - Follows Refine best practices for custom queries
 *
 * @returns React Query result with organizations data
 *
 * @example
 * ```tsx
 * const { data: organizations, isLoading } = useCurrentOrganizations();
 *
 * if (isLoading) return <Spin />;
 *
 * return (
 *   <Select>
 *     {organizations?.map(org => (
 *       <Select.Option key={org.id} value={org.id}>
 *         {org.name}
 *       </Select.Option>
 *     ))}
 *   </Select>
 * );
 * ```
 */
export const useCurrentOrganizations = () => {
  const apiUrl = useApiUrl();

  return useQuery<Organization[]>({
    queryKey: ["organizations", "current"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/org/current`, {
        withCredentials: true, // Include cookies for authentication
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // Keep cache fresh for 5 minutes
    retry: 1, // Retry once on failure
  });
};

/**
 * Custom hook to fetch a specific organization by ID
 * Note: This would require a backend endpoint like GET /api/v1/org/{id}
 * Currently using the current org list and filtering client-side
 *
 * @param orgId - The organization ID to fetch
 * @returns React Query result with organization data
 *
 * @example
 * ```tsx
 * const { data: org, isLoading } = useOrganization("org_123");
 * ```
 */
export const useOrganization = (orgId: string | undefined) => {
  const { data: organizations, ...rest } = useCurrentOrganizations();

  return {
    ...rest,
    data: organizations?.find((org) => org.id === orgId),
  };
};
