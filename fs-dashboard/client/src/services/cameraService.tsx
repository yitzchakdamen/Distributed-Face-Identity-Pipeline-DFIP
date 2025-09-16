import api from "./api";
import type { ICamera, CameraFilters, CamerasResponse } from "../@types/Camera";

export const getAllCameras = async (filters?: CameraFilters): Promise<CamerasResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await api.get(`/cameras?${params.toString()}`);
  return response.data;
};

export const getCameraById = async (id: string): Promise<{ success: boolean; data?: ICamera; error?: string }> => {
  const response = await api.get(`/cameras/${id}`);
  return response.data;
};

export const getCameraStatus = async (id: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  const response = await api.get(`/cameras/${id}/status`);
  return response.data;
};
