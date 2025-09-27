-- 1) Ensure unique index on profiles.user_id to allow FKs
create unique index if not exists profiles_user_id_unique_idx
on public.profiles(user_id);

-- Attach constraint to use the index (safe if already exists will error; so wrap with DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_id_unique
    UNIQUE USING INDEX profiles_user_id_unique_idx;
  END IF;
END $$;

-- 2) Add missing foreign keys for relationships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'incident_comments_incident_id_fkey'
  ) THEN
    ALTER TABLE public.incident_comments
    ADD CONSTRAINT incident_comments_incident_id_fkey
    FOREIGN KEY (incident_id)
    REFERENCES public.incidents(id)
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'incident_comments_user_id_fkey'
  ) THEN
    ALTER TABLE public.incident_comments
    ADD CONSTRAINT incident_comments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(user_id)
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'incidents_user_id_fkey'
  ) THEN
    ALTER TABLE public.incidents
    ADD CONSTRAINT incidents_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(user_id)
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'incidents_it_user_id_fkey'
  ) THEN
    ALTER TABLE public.incidents
    ADD CONSTRAINT incidents_it_user_id_fkey
    FOREIGN KEY (it_user_id)
    REFERENCES public.profiles(user_id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Create storage bucket for incident attachments (public for simple access via getPublicUrl)
insert into storage.buckets (id, name, public)
values ('incident-attachments', 'incident-attachments', true)
on conflict (id) do nothing;

-- 4) Storage policies for the bucket
-- Public read of incident attachments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Incident attachments are publicly accessible'
  ) THEN
    CREATE POLICY "Incident attachments are publicly accessible"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'incident-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload incident attachments to their folder'
  ) THEN
    CREATE POLICY "Users can upload incident attachments to their folder"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'incident-attachments'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own incident attachments'
  ) THEN
    CREATE POLICY "Users can update their own incident attachments"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'incident-attachments'
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'incident-attachments'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;