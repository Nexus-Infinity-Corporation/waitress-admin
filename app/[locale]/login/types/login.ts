export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginState {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
}
