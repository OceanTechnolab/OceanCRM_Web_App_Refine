import type {
  Appointment,
  CreateAppointmentPayload,
} from "../interfaces/appointment";
import { axiosInstance, API_URL } from "../providers/data";

export const appointmentService = {
  getAppointmentsByLeadId: async (leadId: string): Promise<Appointment[]> => {
    console.log("[APPOINTMENT] Fetching appointments for lead:", leadId);

    // Note: x-org-id header is automatically added by Axios interceptor
    const response = await axiosInstance.get(
      `${API_URL}/appointment?lead_id=${leadId}`,
    );

    console.log("[APPOINTMENT] Fetched appointments:", response.data);
    return response.data;
  },

  createAppointment: async (
    payload: CreateAppointmentPayload,
  ): Promise<Appointment> => {
    console.log(
      "[APPOINTMENT] Creating appointment with payload:",
      JSON.stringify(payload, null, 2),
    );

    // Note: x-org-id header is automatically added by Axios interceptor
    const response = await axiosInstance.post(
      `${API_URL}/appointment`,
      payload,
    );

    console.log("[APPOINTMENT] Created appointment:", response.data);
    return response.data;
    // Note: Errors are handled centrally by Axios interceptor
  },
};
