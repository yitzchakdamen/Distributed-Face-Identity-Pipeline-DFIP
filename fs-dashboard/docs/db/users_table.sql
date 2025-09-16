create table public.users (
  id UUID default gen_random_uuid () primary key,
  username VARCHAR(30) not null unique check (
    LENGTH(username) >= 3
    and LENGTH(username) <= 30
  ),
  password VARCHAR(255) not null check (LENGTH(password) >= 6),
  name VARCHAR(100) not null check (LENGTH(name) <= 100),
  email VARCHAR(255) not null unique check (
    email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  ),
  role VARCHAR(20) default 'viewer' check (role in ('admin', 'operator', 'viewer')),
  created_at timestamp with time zone default NOW(),
  updated_at timestamp with time zone default NOW()
);

-- Optional: Index for performance on common queries
create index idx_users_email on public.users (email);
create index idx_users_username on public.users (username);