export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  role_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}
