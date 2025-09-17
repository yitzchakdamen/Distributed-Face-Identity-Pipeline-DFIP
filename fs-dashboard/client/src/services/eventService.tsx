import api from "./api";
import type { IEvent, EventFilters, EventsResponse } from "../@types/Event";

export const getAllEvents = async (filters?: EventFilters): Promise<EventsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await api.get(`/events?${params.toString()}`);
  return response.data;
};

export const getEventById = async (id: string): Promise<{ success: boolean; data?: IEvent; error?: string }> => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const getEventImage = async (eventId: string): Promise<{ success: boolean; data?: string; error?: string }> => {
  try {
    const response = await api.get(`/events/${eventId}/image`, {
      responseType: 'blob'
    });
    
    if (response.data) {
      // Convert blob to base64
      const blob = new Blob([response.data]);
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve({
            success: true,
            data: base64
          });
        };
        reader.readAsDataURL(blob);
      });
    }
    
    return { success: false, error: "No image data received" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch image" };
  }
};

export const getEventStats = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
  const response = await api.get("/events/stats");
  return response.data;
};
