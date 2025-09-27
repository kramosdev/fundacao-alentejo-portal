-- Fix incidents table foreign key
ALTER TABLE public.incidents DROP CONSTRAINT IF EXISTS incidents_user_id_fkey;
ALTER TABLE public.incidents ADD CONSTRAINT incidents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create role management tables
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Admin can manage all user roles" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Direction can manage DGIEA roles" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'direcao')
  AND role IN ('DGIEA', 'colaborador')
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies for departments
CREATE POLICY "Users can view active departments" ON public.departments FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage departments" ON public.departments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
CREATE POLICY "Admin can view all audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Create system settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system_settings
CREATE POLICY "Users can view public settings" ON public.system_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admin can manage all settings" ON public.system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Create incident comments table for ticket system
CREATE TABLE public.incident_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on incident_comments
ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for incident_comments
CREATE POLICY "Users can view comments on their incidents" ON public.incident_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM incidents WHERE incidents.id = incident_comments.incident_id AND incidents.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('DGIEA', 'admin'))
);

CREATE POLICY "Users can create comments on their incidents" ON public.incident_comments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM incidents WHERE incidents.id = incident_comments.incident_id AND incidents.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('DGIEA', 'admin'))
);

-- Create pending registrations table
CREATE TABLE public.pending_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  requested_role TEXT DEFAULT 'colaborador',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pending_registrations
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for pending_registrations
CREATE POLICY "Direction can manage registrations" ON public.pending_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('direcao', 'admin'))
);

-- Add some default departments
INSERT INTO public.departments (name, description) VALUES
('Direção', 'Direção da Fundação'),
('DGIEA', 'Departamento de Gestão de Informação e Estatística'),
('Recursos Humanos', 'Departamento de Recursos Humanos'),
('Financeiro', 'Departamento Financeiro'),
('Operações', 'Departamento de Operações'),
('TI', 'Tecnologias de Informação');

-- Add some default system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
('app_name', '"Sistema de Gestão da Fundação"', 'Nome da aplicação', 'general', true),
('max_file_size', '10485760', 'Tamanho máximo de ficheiro em bytes (10MB)', 'files', false),
('require_approval', 'true', 'Requisições requerem aprovação', 'requests', false),
('default_request_priority', '"media"', 'Prioridade padrão das requisições', 'requests', false),
('incident_auto_assign', 'true', 'Atribuição automática de incidentes ao TI', 'incidents', false);

-- Add trigger for updated_at on departments
CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on system_settings
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on pending_registrations
CREATE TRIGGER update_pending_registrations_updated_at
BEFORE UPDATE ON public.pending_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();