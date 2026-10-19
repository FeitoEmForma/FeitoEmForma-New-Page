-- FEITO EM FORMA v5.1 — MIGRAÇÃO SEGURA E REPETÍVEL
-- Execute no SQL Editor do MESMO projeto Supabase usado em config.js.
-- Não exclui produtos, encomendas, administradores ou imagens existentes.
create extension if not exists pgcrypto;
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), name text not null,
 description text not null default '', price numeric(12,2) not null check(price>=0),
 category text not null default 'FEITO EM FORMA', material text default 'PLA', size text default '', height text default '',
 image_url text, image_urls text[] not null default '{}'::text[],
 discount_min integer check(discount_min>0), discount_price numeric(12,2) check(discount_price>=0),
 personalization boolean not null default false, active boolean not null default true,
 sort_order integer not null default 0, created_at timestamptz not null default now(),
 constraint products_discount_pair check ((discount_min is null)=(discount_price is null))
);
alter table public.products add column if not exists image_urls text[] not null default '{}'::text[];
alter table public.products add column if not exists created_at timestamptz not null default now();
update public.products set image_urls=array[image_url] where image_url is not null and image_url<>'' and coalesce(array_length(image_urls,1),0)=0;
create table if not exists public.completed_orders (
 id uuid primary key default gen_random_uuid(), title text not null,
 category text not null default 'Personalizados', description text not null default '',
 instagram_url text not null default '', image_urls text[] not null default '{}'::text[],
 active boolean not null default true, sort_order integer not null default 0,
 created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.completed_orders enable row level security;
drop policy if exists "read own admin membership" on public.admins;
create policy "read own admin membership" on public.admins for select to authenticated using (user_id=auth.uid());
drop policy if exists "public read visible products" on public.products;
create policy "public read visible products" on public.products for select to anon,authenticated using (active=true or exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin insert" on public.products;
create policy "admin insert" on public.products for insert to authenticated with check (exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin update" on public.products;
create policy "admin update" on public.products for update to authenticated using (exists(select 1 from public.admins where user_id=auth.uid())) with check (exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin delete" on public.products;
create policy "admin delete" on public.products for delete to authenticated using (exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "public read completed orders" on public.completed_orders;
create policy "public read completed orders" on public.completed_orders for select to anon,authenticated using (active=true or exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin insert completed orders" on public.completed_orders;
create policy "admin insert completed orders" on public.completed_orders for insert to authenticated with check (exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin update completed orders" on public.completed_orders;
create policy "admin update completed orders" on public.completed_orders for update to authenticated using (exists(select 1 from public.admins where user_id=auth.uid())) with check (exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin delete completed orders" on public.completed_orders;
create policy "admin delete completed orders" on public.completed_orders for delete to authenticated using (exists(select 1 from public.admins where user_id=auth.uid()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('completed-order-images','completed-order-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true;
drop policy if exists "public product image access" on storage.objects;
create policy "public product image access" on storage.objects for select to public using(bucket_id='product-images');
drop policy if exists "admin product image upload" on storage.objects;
create policy "admin product image upload" on storage.objects for insert to authenticated with check(bucket_id='product-images' and exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin product image delete" on storage.objects;
create policy "admin product image delete" on storage.objects for delete to authenticated using(bucket_id='product-images' and exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "public completed order image access" on storage.objects;
create policy "public completed order image access" on storage.objects for select to public using(bucket_id='completed-order-images');
drop policy if exists "admin completed order image upload" on storage.objects;
create policy "admin completed order image upload" on storage.objects for insert to authenticated with check(bucket_id='completed-order-images' and exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin completed order image delete" on storage.objects;
create policy "admin completed order image delete" on storage.objects for delete to authenticated using(bucket_id='completed-order-images' and exists(select 1 from public.admins where user_id=auth.uid()));
