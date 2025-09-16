export interface IUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  name: string;
  email: string;
  role?: "admin" | "operator" | "viewer";
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    user: IUser;
    token: string;
  };
}
