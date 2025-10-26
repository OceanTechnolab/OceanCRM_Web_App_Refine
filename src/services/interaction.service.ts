import type {
  Interaction,
  CreateInteractionPayload,
} from "../interfaces/interaction";
import { axiosInstance, API_URL } from "../providers/data";

export const interactionService = {
  getInteractionsByLeadId: async (leadId: string): Promise<Interaction[]> => {
    // Note: x-org-id header is automatically added by Axios interceptor
    const response = await axiosInstance.get(
      `${API_URL}/interaction?lead_id=${leadId}`,
    );

    return response.data;
  },

  createInteraction: async (
    payload: CreateInteractionPayload,
  ): Promise<Interaction> => {
    console.log(
      "[INTERACTION] Creating interaction with payload:",
      JSON.stringify(payload, null, 2),
    );

    // Note: x-org-id header is automatically added by Axios interceptor
    const response = await axiosInstance.post(
      `${API_URL}/interaction`,
      payload,
    );

    return response.data;
    // Note: Errors are handled centrally by Axios interceptor
  },
};
