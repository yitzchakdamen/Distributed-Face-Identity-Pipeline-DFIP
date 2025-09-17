import api from "./api";
import type { IUser } from "../@types/User";

export const getAllUsers = async (): Promise<{ success: boolean; data?: IUser[]; error?: string }> => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id: string): Promise<{ success: boolean; data?: IUser; error?: string }> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, userData: Partial<IUser>): Promise<{ success: boolean; data?: IUser; error?: string }> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: { username: string; password: string; name: string; email: string; role: string }): Promise<{ success: boolean; data?: IUser; error?: string }> => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const getUsersByRole = async (role: string): Promise<{ success: boolean; data?: IUser[]; error?: string }> => {
  const response = await api.get(`/users?role=${role}`);
  return response.data;
};
