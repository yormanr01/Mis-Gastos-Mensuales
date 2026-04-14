-- Perfiles enlazados a auth.users (misma idea que Firestore users/{uid}).
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text,
  role text not null check (role in ('Administrador', 'Edición', 'Visualización')) default 'Visualización',
  status text not null check (status in ('Activo', 'Inactivo')) default 'Activo'
);

-- Descuentos por defecto compartidos (equivalente a localStorage fixedValues).
create table public.app_settings (
  id int primary key default 1 check (id = 1),
  water_discount numeric not null default 0,
  electricity_discount numeric not null default 0,
  internet_discount numeric not null default 0
);

insert into public.app_settings default values;

create table public.water_records (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month text not null,
  total_invoiced numeric not null,
  discount numeric not null,
  total_to_pay numeric not null,
  status text not null check (status in ('Pendiente', 'Pagado')),
  unique (year, month)
);

create table public.electricity_records (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month text not null,
  total_invoiced numeric not null,
  kwh_consumption numeric not null,
  kwh_cost numeric not null,
  previous_meter int not null,
  current_meter int not null,
  consumption_meter int not null,
  discount numeric not null,
  total_to_pay numeric not null,
  status text not null check (status in ('Pendiente', 'Pagado')),
  unique (year, month)
);

create table public.internet_records (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month text not null,
  monthly_cost numeric not null,
  discount numeric not null,
  total_to_pay numeric not null,
  status text not null check (status in ('Pendiente', 'Pagado')),
  unique (year, month)
);

alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.water_records enable row level security;
alter table public.electricity_records enable row level security;
alter table public.internet_records enable row level security;

-- MVP: cualquier usuario autenticado puede leer/escribir (igual que colecciones globales actuales).
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_admin_only" on public.profiles
  for update to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'Administrador'
        and p.status = 'Activo'
    )
  );

-- Los usuarios aún pueden actualizar su propio email (ejemplo) pero no su rol ni estado
create policy "profiles_update_self" on public.profiles
  for update to authenticated 
  using (auth.uid() = id)
  with check (
    auth.uid() = id 
    and role = (select role from public.profiles where id = auth.uid()) -- El rol no cambia
    and status = (select status from public.profiles where id = auth.uid()) -- El estado no cambia
  );

create policy "profiles_insert_authenticated" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "app_settings_all_authenticated" on public.app_settings
  for all to authenticated using (true) with check (true);

create policy "water_all_authenticated" on public.water_records
  for all to authenticated using (true) with check (true);

create policy "electricity_all_authenticated" on public.electricity_records
  for all to authenticated using (true) with check (true);

create policy "internet_all_authenticated" on public.internet_records
  for all to authenticated using (true) with check (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role, status)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', ''), 'Visualización', 'Activo');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
