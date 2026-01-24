/**
 * Database representation of administrators table
 * This matches the actual SQL schema exactly
 */
export interface DatabaseAdministrator {
  id: string; // UUID, same as users.id and auth.users.id
  created_at: string; // Timestamp with timezone
  role_id: number | null; // Foreign key to roles.id
  updated_at: string | null; // Timestamp with timezone
  phone: string | null; // Text
  status: string | null; // Character varying
  username: string | null; // Text
}

/**
 * UI representation of Administrator with computed/joined fields
 * This is used by components and includes data from users table
 */
export interface Administrator {
  id: string; // Same ID as users.id and auth.users.id
  name: string; // Computed from users.first_name + users.last_name
  email: string; // From users.email
  phone: string; // From administrators.phone
  role: string; // Computed from roles.name or role_id
  status: "active" | "inactive" | "suspended"; // From administrators.status
  is_active: boolean; // Computed from status and users.is_active
  created_at: string; // From administrators.created_at
  updated_at: string; // From administrators.updated_at
  username?: string; // From administrators.username
}
