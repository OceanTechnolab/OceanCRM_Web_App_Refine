import { useList, useCreate, useInvalidate } from "@refinedev/core";
import type { Contact, CreateContactPayload } from "@/interfaces/contact";

/**
 * Custom hook to fetch contacts by business ID using Refine's data hooks
 */
export const useContactsByBusinessId = (businessId: string | undefined) => {
  return useList<Contact>({
    resource: "contact",
    filters: businessId
      ? [
          {
            field: "business_id",
            operator: "eq",
            value: businessId,
          },
        ]
      : undefined,
    queryOptions: {
      enabled: !!businessId,
      staleTime: 30 * 1000,
    },
  });
};

/**
 * Custom hook to create a contact using Refine's data hooks
 */
export const useCreateContact = () => {
  const invalidate = useInvalidate();

  return useCreate<Contact, any, CreateContactPayload>({
    resource: "contact",
    mutationOptions: {
      onSuccess: () => {
        invalidate({
          resource: "contact",
          invalidates: ["list"],
        });
      },
    },
  });
};
