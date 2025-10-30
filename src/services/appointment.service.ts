import { useList, useCreate, useInvalidate } from "@refinedev/core";
import type {
  Appointment,
  CreateAppointmentPayload,
} from "../interfaces/appointment";

/**
 * Custom hook to fetch appointments by lead ID using Refine's data hooks
 * Benefits:
 * - Automatic caching and deduplication
 * - Automatic error handling via authProvider.onError
 * - Loading and error states
 * - Automatic cache invalidation on mutations
 */
export const useAppointmentsByLeadId = (leadId: string | undefined) => {
  return useList<Appointment>({
    resource: "appointment",
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
        field: "scheduled_at",
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
 * Custom hook to create an appointment using Refine's data hooks
 * Benefits:
 * - Automatic cache invalidation
 * - Optimistic updates support
 * - Automatic error handling
 */
export const useCreateAppointment = () => {
  const invalidate = useInvalidate();

  return useCreate<Appointment, any, CreateAppointmentPayload>({
    resource: "appointment",
    successNotification: (data) => ({
      message: "Appointment scheduled successfully",
      type: "success",
    }),
    errorNotification: (error) => ({
      message: error?.message || "Failed to schedule appointment",
      type: "error",
    }),
    meta: {
      onSuccess: () => {
        // Invalidate appointment list cache to refetch
        invalidate({
          resource: "appointment",
          invalidates: ["list"],
        });
      },
    },
  });
};
