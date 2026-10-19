-- Feito em Forma v6.3 — campos para selecionar destaques da página inicial
-- Execute uma vez no SQL Editor do Supabase.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS showcase_order integer NOT NULL DEFAULT 0;
-- Produtos antigos permanecem no catálogo; nenhum entra automaticamente no carrossel.
-- As permissões de atualização continuam sendo as mesmas da tabela products (RLS existente).
