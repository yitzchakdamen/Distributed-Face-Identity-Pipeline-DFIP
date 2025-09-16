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

export const getEventStats = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
  const response = await api.get("/events/stats");
  return response.data;
};
