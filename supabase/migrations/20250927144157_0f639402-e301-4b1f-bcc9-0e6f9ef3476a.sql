-- 1. Fix pending_registrations RLS policy - allow anyone to register
DROP POLICY IF EXISTS "Direction can manage registrations" ON public.pending_registrations;

CREATE POLICY "Anyone can create registration requests" ON public.pending_registrations
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Direction can manage all registrations" ON public.pending_registrations
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('direcao', 'admin')
  )
);

-- 2. Fix incidents foreign key constraint name that PostgREST expects
-- Drop existing constraint
ALTER TABLE public.incidents DROP CONSTRAINT IF EXISTS incidents_user_id_fkey;

-- Add new constraint with proper naming for PostgREST relationship detection  
ALTER TABLE public.incidents
ADD CONSTRAINT incidents_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

-- Same for IT user
ALTER TABLE public.incidents DROP CONSTRAINT IF EXISTS incidents_it_user_id_fkey;
ALTER TABLE public.incidents
ADD CONSTRAINT incidents_it_user_id_fkey  
FOREIGN KEY (it_user_id) REFERENCES public.profiles(user_id)
ON DELETE SET NULL;

-- 3. Fix incident_comments foreign key as well
ALTER TABLE public.incident_comments DROP CONSTRAINT IF EXISTS incident_comments_user_id_fkey;
ALTER TABLE public.incident_comments
ADD CONSTRAINT incident_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

-- 4. Also ensure requests table has proper FK for user relationships
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_user_id_fkey;
ALTER TABLE public.requests
ADD CONSTRAINT requests_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

-- 5. Add FK for DGIEA and direction users in requests
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_dgiea_user_id_fkey;
ALTER TABLE public.requests
ADD CONSTRAINT requests_dgiea_user_id_fkey
FOREIGN KEY (dgiea_user_id) REFERENCES public.profiles(user_id)
ON DELETE SET NULL;

ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_direction_user_id_fkey;
ALTER TABLE public.requests
ADD CONSTRAINT requests_direction_user_id_fkey
FOREIGN KEY (direction_user_id) REFERENCES public.profiles(user_id)
ON DELETE SET NULL;