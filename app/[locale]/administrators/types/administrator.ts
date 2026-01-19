export interface Administrator {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
