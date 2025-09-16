-- Cameras table
create table public.cameras (
  id UUID default gen_random_uuid () primary key,
  name VARCHAR(100) not null check (LENGTH(name) >= 1 and LENGTH(name) <= 100),
  camera_id VARCHAR(50) not null unique check (LENGTH(camera_id) >= 1),
  connection_string VARCHAR(500) not null check (LENGTH(connection_string) >= 1),
  created_by UUID not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default NOW(),
  updated_at timestamp with time zone default NOW()
);

-- Camera user assignments table (many-to-many relationship)
create table public.camera_user_assignments (
  id UUID default gen_random_uuid () primary key,
  camera_id UUID not null references public.cameras(id) on delete cascade,
  user_id UUID not null references public.users(id) on delete cascade,
  assigned_by UUID not null references public.users(id) on delete cascade,
  assigned_at timestamp with time zone default NOW(),
  unique(camera_id, user_id)
);

-- Indexes for performance
create index idx_cameras_created_by on public.cameras (created_by);
create index idx_cameras_camera_id on public.cameras (camera_id);
create index idx_camera_assignments_camera_id on public.camera_user_assignments (camera_id);
create index idx_camera_assignments_user_id on public.camera_user_assignments (user_id);
create index idx_camera_assignments_assigned_by on public.camera_user_assignments (assigned_by);

-- RLS (Row Level Security) policies will be added later based on user roles
