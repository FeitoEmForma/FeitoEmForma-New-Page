-- Execute uma única vez no SQL Editor do Supabase.
-- NULL = produto produzido sob encomenda / sem controle de estoque físico.
-- 0 = sem unidades prontas. N > 0 = unidades disponíveis.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_stock_quantity_nonnegative;
ALTER TABLE public.products ADD CONSTRAINT products_stock_quantity_nonnegative CHECK (stock_quantity IS NULL OR stock_quantity >= 0);
-- Políticas RLS existentes para products continuam válidas.
