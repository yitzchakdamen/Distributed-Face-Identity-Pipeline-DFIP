export interface IEvent {
  id: string;
  person_id: string;
  camera_id: string;
  image_id: string;
  timestamp: string;
  confidence: number;
  location: string;
  risk_level: 'low' | 'medium' | 'high';
  message: string;
}

export interface EventFilters {
  camera_id?: string;
  risk_level?: 'low' | 'medium' | 'high';
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface EventsResponse {
  success: boolean;
  data?: IEvent[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  error?: string;
}
