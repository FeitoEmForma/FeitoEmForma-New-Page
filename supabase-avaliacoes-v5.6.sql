-- Execute uma vez no SQL Editor do projeto Supabase da Feito em Forma.
-- Mantém tabelas existentes intactas. Moderação é obrigatória.
create extension if not exists pgcrypto;
create table if not exists public.customer_reviews (
 id uuid primary key default gen_random_uuid(),
 customer_name text not null check(char_length(trim(customer_name)) between 2 and 80),
 product_name text not null check(char_length(trim(product_name)) between 2 and 120),
 rating integer not null check(rating between 1 and 5),
 comment text not null check(char_length(trim(comment)) between 10 and 800),
 photo_url text,
 photo_path text,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(),
 constraint review_photo_pair check((photo_url is null)=(photo_path is null))
);
create index if not exists customer_reviews_status_date on public.customer_reviews(status,created_at desc);
alter table public.customer_reviews enable row level security;
revoke all on public.customer_reviews from anon,authenticated;
grant select,insert on public.customer_reviews to anon;
grant select,insert,update,delete on public.customer_reviews to authenticated;
-- Visitantes podem enviar, mas não aprovar ou editar.
drop policy if exists "public insert pending reviews" on public.customer_reviews;
create policy "public insert pending reviews" on public.customer_reviews for insert to anon,authenticated
 with check(status='pending' and created_at <= now() and created_at >= now()-interval '1 minute'
 and (photo_url is null or (photo_path like 'pendentes/%' and photo_url like 'https://%/storage/v1/object/public/customer-review-images/%')));
drop policy if exists "read approved reviews or admin" on public.customer_reviews;
create policy "read approved reviews or admin" on public.customer_reviews for select to anon,authenticated
 using(status='approved' or exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin update reviews" on public.customer_reviews;
create policy "admin update reviews" on public.customer_reviews for update to authenticated
 using(exists(select 1 from public.admins where user_id=auth.uid()))
 with check(exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin delete reviews" on public.customer_reviews;
create policy "admin delete reviews" on public.customer_reviews for delete to authenticated
 using(exists(select 1 from public.admins where user_id=auth.uid()));
-- O bucket é público para mostrar fotos aprovadas; URLs de pendentes não são listadas no site.
-- Atenção: links diretos para imagens ainda podem ser acessados antes da aprovação.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('customer-review-images','customer-review-images',true,3145728,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do update set public=true,file_size_limit=3145728,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "public view customer review photos" on storage.objects;
create policy "public view customer review photos" on storage.objects for select to public using(bucket_id='customer-review-images');
drop policy if exists "customer review upload" on storage.objects;
create policy "customer review upload" on storage.objects for insert to anon,authenticated
 with check(bucket_id='customer-review-images' and (storage.foldername(name))[1]='pendentes');
drop policy if exists "admin delete customer review photos" on storage.objects;
create policy "admin delete customer review photos" on storage.objects for delete to authenticated
 using(bucket_id='customer-review-images' and exists(select 1 from public.admins where user_id=auth.uid()));
