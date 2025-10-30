import { useList, useApiUrl } from "@refinedev/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { User } from "../interfaces/user";

export interface LoggedUser {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  avatar_url?: string | null;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
}

/**
 * Custom hook to fetch all users using Refine's data hooks
 * Endpoint: GET /api/v1/user
 *
 * Benefits:
 * - Automatic caching and deduplication
 * - Automatic error handling via authProvider.onError
 * - Loading and error states
 * - Automatic cache invalidation on mutations
 *
 * @returns Refine useList result with users data
 *
 * @example
 * ```tsx
 * const { query: { data, isLoading } } = useUsers();
 * const users = data?.data || [];
 * ```
 */
export const useUsers = () => {
  return useList<User>({
    resource: "user",
    pagination: {
      mode: "off", // Fetch all users
    },
    queryOptions: {
      // Keep cache fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
    },
  });
};

/**
 * Custom hook to fetch the currently logged-in user using Refine patterns
 * Endpoint: GET /api/v1/user/logged
 *
 * Benefits:
 * - Automatic caching with React Query
 * - Loading and error states
 * - Integrates with Refine's API configuration
 * - Follows Refine best practices for custom queries
 * - Separate from getIdentity to allow for more flexible usage
 *
 * @returns React Query result with logged user data
 *
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useLoggedUser();
 *
 * if (isLoading) return <Spin />;
 * if (error) return <Alert message="Failed to load user" />;
 *
 * return (
 *   <div>
 *     <Avatar src={user?.avatar_url} />
 *     <span>{user?.name}</span>
 *     <span>{user?.email}</span>
 *   </div>
 * );
 * ```
 */
export const useLoggedUser = () => {
  const apiUrl = useApiUrl();

  return useQuery<LoggedUser>({
    queryKey: ["user", "logged"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/user/logged`, {
        withCredentials: true, // Include cookies for authentication
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // Keep cache fresh for 5 minutes
    retry: 1, // Retry once on failure
  });
};
