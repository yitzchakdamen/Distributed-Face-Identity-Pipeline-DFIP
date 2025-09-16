export interface ICamera {
  id: string;
  name: string;
  camera_id: string;
  connection_string: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CameraFilters {
  status?: 'active' | 'inactive';
  location?: string;
}

export interface CamerasResponse {
  success: boolean;
  message?: string;
  data?: ICamera[];
  total?: number;
  error?: string;
}
