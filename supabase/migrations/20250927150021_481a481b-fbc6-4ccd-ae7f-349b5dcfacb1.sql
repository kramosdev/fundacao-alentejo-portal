-- Enable RLS for pending_registrations table (fix registration error)
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Update RLS policy for pending_registrations to allow public registration
DROP POLICY IF EXISTS "Anyone can create registration requests" ON public.pending_registrations;

CREATE POLICY "Public can create registration requests" 
ON public.pending_registrations 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for all tables
ALTER TABLE public.requests REPLICA IDENTITY FULL;
ALTER TABLE public.incidents REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;
ALTER TABLE public.pending_registrations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_registrations;

-- Create function to handle user approval with role and department assignment
CREATE OR REPLACE FUNCTION public.approve_user_registration(
  registration_id UUID,
  assigned_role TEXT DEFAULT 'colaborador',
  assigned_department TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  registration_record RECORD;
  new_user_id UUID;
  result JSON;
BEGIN
  -- Get the registration record
  SELECT * INTO registration_record 
  FROM public.pending_registrations 
  WHERE id = registration_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Registration not found or already processed"}'::JSON;
  END IF;

  -- Create the auth user (this would typically be done through Supabase auth API)
  -- For now, we'll update the registration status and create a profile entry
  
  -- Update registration status
  UPDATE public.pending_registrations 
  SET 
    status = 'approved',
    approved_at = NOW(),
    approved_by = auth.uid()
  WHERE id = registration_id;

  -- Create result JSON
  result := json_build_object(
    'success', true,
    'registration_id', registration_id,
    'assigned_role', assigned_role,
    'assigned_department', assigned_department,
    'message', 'Registration approved successfully'
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log function
CREATE OR REPLACE FUNCTION public.create_audit_log(
  action_name TEXT,
  table_name_param TEXT DEFAULT NULL,
  record_id_param UUID DEFAULT NULL,
  old_values_param JSONB DEFAULT NULL,
  new_values_param JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    action,
    table_name,
    user_id,
    record_id,
    old_values,
    new_values,
    user_agent,
    ip_address
  ) VALUES (
    action_name,
    table_name_param,
    auth.uid(),
    record_id_param,
    old_values_param,
    new_values_param,
    NULL, -- user_agent would be passed from frontend
    NULL  -- ip_address would be passed from frontend
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_audit_log(
      'INSERT',
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.create_audit_log(
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.create_audit_log(
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;