export interface ICamera {
  id: string;
  name: string;
  location: string;
  ip_address: string;
  status: 'active' | 'inactive';
  last_seen: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CameraFilters {
  status?: 'active' | 'inactive';
  location?: string;
}

export interface CamerasResponse {
  success: boolean;
  data?: ICamera[];
  error?: string;
}
