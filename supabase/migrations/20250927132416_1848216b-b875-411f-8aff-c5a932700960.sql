-- Fix syntax error and create proper trigger and indexes
-- 1) Drop and recreate trigger on auth.users if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2) Add unique constraint properly
DO $$ 
BEGIN
  -- Check if constraint exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- 3) Auto-update updated_at columns
DROP TRIGGER IF EXISTS set_timestamp_on_profiles ON public.profiles;
CREATE TRIGGER set_timestamp_on_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_timestamp_on_requests ON public.requests;
CREATE TRIGGER set_timestamp_on_requests
BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Performance indexes
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_history_request_id ON public.request_history(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_categories_active_type ON public.request_categories(is_active, type);

-- 5) Improve realtime change payloads
ALTER TABLE public.requests REPLICA IDENTITY FULL;

-- 6) Seed request categories
INSERT INTO public.request_categories (name, type, description, is_active, requires_approval)
SELECT 'Reserva de Viatura', 'viatura', 'Requisição de viatura institucional', true, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.request_categories WHERE name = 'Reserva de Viatura'
);

INSERT INTO public.request_categories (name, type, description, is_active, requires_approval)
SELECT 'Alimentação - Eventos', 'alimentacao', 'Fornecimento de refeições para eventos', true, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.request_categories WHERE name = 'Alimentação - Eventos'
);

INSERT INTO public.request_categories (name, type, description, is_active, requires_approval)
SELECT 'Material de Escritório', 'material', 'Aquisição de material de escritório', true, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.request_categories WHERE name = 'Material de Escritório'
);

INSERT INTO public.request_categories (name, type, description, is_active, requires_approval)
SELECT 'Outros', 'outro', 'Outros tipos de requisições', true, false
WHERE NOT EXISTS (
  SELECT 1 FROM public.request_categories WHERE name = 'Outros'
);