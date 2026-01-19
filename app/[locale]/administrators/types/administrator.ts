export interface Administrator {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
  registrationDate: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
