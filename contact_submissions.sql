-- Create contact_submissions table
create table if not exists contact_submissions (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text default 'new', -- new, read, replied
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table contact_submissions enable row level security;

-- Policy: Allow public to insert (anyone can send a message)
create policy "Anyone can insert contact submissions"
  on contact_submissions for insert
  with check (true);

-- Policy: Allow admins to view all submissions
create policy "Admins can view contact submissions"
  on contact_submissions for select
  using (auth.role() = 'service_role' or exists (
    select 1 from admin_users where id = auth.uid()
  ));
