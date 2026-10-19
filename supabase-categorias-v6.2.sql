-- Feito em Forma v6.2 — execute no SQL Editor do Supabase, uma única vez.
-- Preserva produtos existentes e importa automaticamente suas categorias.
create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(),
 name text not null unique check(length(trim(name)) between 1 and 100),
 created_at timestamptz not null default now()
);
insert into public.categories(name)
select distinct trim(category) from public.products where trim(coalesce(category,''))<>''
on conflict (name) do nothing;
alter table public.categories enable row level security;
drop policy if exists "read categories" on public.categories;
create policy "read categories" on public.categories for select to anon,authenticated using(true);
drop policy if exists "admin create categories" on public.categories;
create policy "admin create categories" on public.categories for insert to authenticated
 with check(exists(select 1 from public.admins where user_id=auth.uid()));
drop policy if exists "admin delete categories" on public.categories;
create policy "admin delete categories" on public.categories for delete to authenticated
 using(exists(select 1 from public.admins where user_id=auth.uid()));
-- Renomeia categoria e produtos em uma única transação, sem inconsistência.
create or replace function public.rename_product_category(category_id uuid,new_name text)
returns void language plpgsql security definer set search_path = public as $$
declare old_name text;
begin
 if not exists(select 1 from public.admins where user_id=auth.uid()) then raise exception 'Acesso não autorizado';end if;
 new_name:=trim(new_name);
 if new_name is null or length(new_name) not between 1 and 100 then raise exception 'Nome inválido';end if;
 select name into old_name from public.categories where id=category_id for update;
 if old_name is null then raise exception 'Categoria não encontrada';end if;
 update public.categories set name=new_name where id=category_id;
 update public.products set category=new_name where category=old_name;
end;$$;
revoke all on function public.rename_product_category(uuid,text) from public;
grant execute on function public.rename_product_category(uuid,text) to authenticated;
-- Impede excluir uma categoria que ainda contém produtos.
create or replace function public.prevent_category_deletion_in_use()
returns trigger language plpgsql set search_path=public as $$
begin
 if exists(select 1 from public.products where category=old.name) then
  raise exception 'Transfira os produtos para outra categoria antes de excluir';
 end if;
 return old;
end;$$;
drop trigger if exists prevent_category_deletion_in_use on public.categories;
create trigger prevent_category_deletion_in_use before delete on public.categories
for each row execute function public.prevent_category_deletion_in_use();
