export interface Contact {
  id?: string;
  business_id?: string;
  name?: string;
  mobile?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactsResponse {
  data: Contact[];
  total: number;
}

export interface CreateContactPayload {
  business_id: string;
  email: string; // Required field
  name?: string;
  mobile?: string;
}
