export interface IEvent {
  _id: string;
  person_id: string;
  camera_id: string;
  image_id: string;
  time: string;
  level: string;
  message: string;
}

export interface EventFilters {
  cameraId?: string;
  level?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export interface EventsResponse {
  success: boolean;
  data?: IEvent[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}
