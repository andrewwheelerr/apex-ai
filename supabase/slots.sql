-- Apex AI — slots table for tool-use MVP
-- Run in Supabase SQL editor.

create table if not exists slots (
  id           uuid primary key default gen_random_uuid(),
  date         date not null,
  time         text not null,   -- stored as "10:00 AM" format
  is_available boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (date, time)           -- prevents double-booking
);

-- Disable RLS for demo (matching existing tables)
alter table slots disable row level security;

-- Allow anon key to read and update
grant select, update on slots to anon;

-- Seed ~3 weeks of availability (May–June 2026)
-- Weekdays: 9am, 10am, 11am, 2pm, 3pm
-- Weekends: 10am, 11am, 2pm
insert into slots (date, time) values
  ('2026-05-22', '09:00 AM'), ('2026-05-22', '10:00 AM'), ('2026-05-22', '11:00 AM'), ('2026-05-22', '02:00 PM'), ('2026-05-22', '03:00 PM'),
  ('2026-05-23', '10:00 AM'), ('2026-05-23', '11:00 AM'), ('2026-05-23', '02:00 PM'),
  ('2026-05-24', '10:00 AM'), ('2026-05-24', '11:00 AM'), ('2026-05-24', '02:00 PM'),
  ('2026-05-27', '09:00 AM'), ('2026-05-27', '10:00 AM'), ('2026-05-27', '11:00 AM'), ('2026-05-27', '02:00 PM'), ('2026-05-27', '03:00 PM'),
  ('2026-05-28', '09:00 AM'), ('2026-05-28', '10:00 AM'), ('2026-05-28', '11:00 AM'), ('2026-05-28', '02:00 PM'), ('2026-05-28', '03:00 PM'),
  ('2026-05-29', '09:00 AM'), ('2026-05-29', '10:00 AM'), ('2026-05-29', '11:00 AM'), ('2026-05-29', '02:00 PM'), ('2026-05-29', '03:00 PM'),
  ('2026-05-30', '10:00 AM'), ('2026-05-30', '11:00 AM'), ('2026-05-30', '02:00 PM'),
  ('2026-05-31', '10:00 AM'), ('2026-05-31', '11:00 AM'), ('2026-05-31', '02:00 PM'),
  ('2026-06-02', '09:00 AM'), ('2026-06-02', '10:00 AM'), ('2026-06-02', '11:00 AM'), ('2026-06-02', '02:00 PM'), ('2026-06-02', '03:00 PM'),
  ('2026-06-03', '09:00 AM'), ('2026-06-03', '10:00 AM'), ('2026-06-03', '11:00 AM'), ('2026-06-03', '02:00 PM'), ('2026-06-03', '03:00 PM'),
  ('2026-06-04', '09:00 AM'), ('2026-06-04', '10:00 AM'), ('2026-06-04', '11:00 AM'), ('2026-06-04', '02:00 PM'), ('2026-06-04', '03:00 PM'),
  ('2026-06-05', '09:00 AM'), ('2026-06-05', '10:00 AM'), ('2026-06-05', '11:00 AM'), ('2026-06-05', '02:00 PM'), ('2026-06-05', '03:00 PM'),
  ('2026-06-06', '10:00 AM'), ('2026-06-06', '11:00 AM'), ('2026-06-06', '02:00 PM'),
  ('2026-06-07', '10:00 AM'), ('2026-06-07', '11:00 AM'), ('2026-06-07', '02:00 PM')
on conflict (date, time) do nothing;
