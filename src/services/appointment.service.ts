import type { Appointment, CreateAppointmentPayload } from '../interfaces/appointment';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const appointmentService = {
  getAppointmentsByLeadId: async (leadId: string): Promise<Appointment[]> => {
    const orgId = localStorage.getItem('org_id');
    
    console.log('[APPOINTMENT] Fetching appointments for lead:', leadId);
    
    const response = await fetch(`${API_BASE_URL}/v1/appointment?lead_id=${leadId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'x-org-id': orgId || '',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 422) {
        const errorData = await response.json();
        if (errorData.detail && errorData.detail.includes("Missing token in request")) {
          const error = new Error("Your session has expired. Please login again.") as any;
          error.status = 422;
          error.statusCode = 422;
          throw error;
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[APPOINTMENT] Fetched appointments:', data);
    return data;
  },

  createAppointment: async (payload: CreateAppointmentPayload): Promise<Appointment> => {
    const orgId = localStorage.getItem('org_id');
    
    console.log('[APPOINTMENT] Creating appointment with payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/v1/appointment`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-org-id': orgId || '',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetail = null;
      
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail;
        
        if (response.status === 422) {
          if (errorDetail && errorDetail.includes("Missing token in request")) {
            const error = new Error("Your session has expired. Please login again.") as any;
            error.status = 422;
            error.statusCode = 422;
            throw error;
          }
          errorMessage = `Validation error: ${errorDetail || 'Invalid data'}`;
        } else if (response.status === 500) {
          errorMessage = `Server error: ${errorDetail || 'Internal server error. Please check the data and try again.'}`;
          console.error('[APPOINTMENT] Server error details:', errorData);
        }
      } catch (e) {
        console.error('[APPOINTMENT] Error parsing error response:', e);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[APPOINTMENT] Created appointment:', data);
    return data;
  },
};
