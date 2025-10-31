// GraphQL Schema Types

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

export type ContactStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "UNQUALIFIED"
  | "QUALIFIED"
  | "NEGOTIATION"
  | "LOST"
  | "WON"
  | "CHURNED";

export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  stage?: string;
  users: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  title: string;
  status: QuoteStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage?: string;
  closeDateMonth?: number;
  closeDateYear?: number;
  createdAt: string;
  updatedAt: string;
}
