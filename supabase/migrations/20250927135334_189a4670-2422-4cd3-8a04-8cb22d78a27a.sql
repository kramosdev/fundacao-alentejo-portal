-- Create incidents table for technical incident management
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hardware', 'software', 'network', 'security', 'other')),
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'critica')),
  status TEXT NOT NULL DEFAULT 'reportado' CHECK (status IN ('reportado', 'em_analise', 'em_resolucao', 'resolvido', 'fechado')),
  location TEXT,
  it_notes TEXT,
  it_user_id UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Create policies for incidents
CREATE POLICY "Users can view their own incidents" 
ON public.incidents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own incidents" 
ON public.incidents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "IT users can view all incidents" 
ON public.incidents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('DGIEA', 'admin', 'direcao')
));

CREATE POLICY "IT users can update incidents" 
ON public.incidents 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('DGIEA', 'admin')
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_incidents_updated_at
BEFORE UPDATE ON public.incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();