export interface Administrator {
  id: string; // Same ID as users.id and auth.users.id
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
