import api from "./api";
import type { IUser, LoginCredentials, RegisterCredentials, AuthResponse } from "../@types/User";

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await api.post("/auth/register", credentials);
  return response.data;
};

export const getCurrentUser = async (): Promise<{ success: boolean; data?: IUser; error?: string }> => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logoutUser = async (): Promise<{ success: boolean; message?: string }> => {
  const response = await api.post("/auth/logout");
  return response.data;
};
