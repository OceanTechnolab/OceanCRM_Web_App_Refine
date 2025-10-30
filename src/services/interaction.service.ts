import { useList, useCreate, useInvalidate } from "@refinedev/core";
import type {
  Interaction,
  CreateInteractionPayload,
} from "../interfaces/interaction";

/**
 * Custom hook to fetch interactions by lead ID using Refine's data hooks
 * Benefits:
 * - Automatic caching and deduplication
 * - Automatic error handling via authProvider.onError
 * - Loading and error states
 * - Automatic cache invalidation on mutations
 */
export const useInteractionsByLeadId = (leadId: string | undefined) => {
  return useList<Interaction>({
    resource: "interaction",
    filters: leadId
      ? [
          {
            field: "lead_id",
            operator: "eq",
            value: leadId,
          },
        ]
      : undefined,
    sorters: [
      {
        field: "interacted_at",
        order: "desc",
      },
    ],
    queryOptions: {
      enabled: !!leadId, // Only fetch if leadId is provided
      staleTime: 30 * 1000, // Keep cache fresh for 30 seconds
    },
  });
};

/**
 * Custom hook to create an interaction using Refine's data hooks
 * Benefits:
 * - Automatic cache invalidation
 * - Optimistic updates support
 * - Automatic error handling
 */
export const useCreateInteraction = () => {
  const invalidate = useInvalidate();

  return useCreate<Interaction, any, CreateInteractionPayload>({
    resource: "interaction",
    successNotification: (data) => ({
      message: "Activity logged successfully",
      type: "success",
    }),
    errorNotification: (error) => ({
      message: error?.message || "Failed to log activity",
      type: "error",
    }),
    meta: {
      onSuccess: () => {
        // Invalidate interaction list cache to refetch
        invalidate({
          resource: "interaction",
          invalidates: ["list"],
        });
      },
    },
  });
};
