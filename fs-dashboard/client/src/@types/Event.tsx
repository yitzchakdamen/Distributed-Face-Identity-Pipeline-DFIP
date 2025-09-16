export interface IEvent {
  _id: string;
  person_id: string;
  camera_id: string;
  image_id: string;
  timestamp: string;
  level: 'low' | 'medium' | 'high';
  metadata: {
    confidence: number;
    bounding_box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    detection_type: string;
    processing_time_ms: number;
  };
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
