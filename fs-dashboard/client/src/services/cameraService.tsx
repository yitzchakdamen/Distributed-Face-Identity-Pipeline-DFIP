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

export const getCameraById = async (
  id: string
): Promise<{ success: boolean; data?: ICamera; error?: string }> => {
  const response = await api.get(`/cameras/${id}`);
  return response.data;
};

export const getCameraStatus = async (
  id: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const response = await api.get(`/cameras/${id}/status`);
  return response.data;
};

export const createCamera = async (cameraData: {
  name: string;
  camera_id: string;
  connection_string: string;
}): Promise<{ success: boolean; data?: ICamera; error?: string }> => {
  const response = await api.post("/cameras", cameraData);
  return response.data;
};

export const assignCameraToUser = async (
  cameraId: string,
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const response = await api.post(`/cameras/${cameraId}/assign`, { user_id: userId });
  return response.data;
};

export const removeCameraAssignment = async (
  cameraId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  const response = await api.delete(`/cameras/${cameraId}/assign/${userId}`);
  return response.data;
};

export const getCameraAssignments = async (
  cameraId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  const response = await api.get(`/cameras/${cameraId}/assignments`);
  return response.data;
};
