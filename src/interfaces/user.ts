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

export interface UsersResponse {
  data: User[];
  total: number;
}
