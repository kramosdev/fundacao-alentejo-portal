import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      console.error('Error fetching system settings:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: string, updates: Partial<SystemSetting>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('system_settings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Configuração atualizada",
        description: "A configuração foi atualizada com sucesso"
      });

      await fetchSettings();
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSetting = async (settingData: Omit<SystemSetting, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('system_settings')
        .insert(settingData);

      if (error) throw error;

      toast({
        title: "Configuração criada",
        description: "A nova configuração foi criada com sucesso"
      });

      await fetchSettings();
    } catch (error: any) {
      console.error('Error creating setting:', error);
      toast({
        title: "Erro ao criar configuração",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key: string): SystemSetting | undefined => {
    return settings.find(setting => setting.key === key);
  };

  const getSettingValue = (key: string, defaultValue: any = null): any => {
    const setting = getSetting(key);
    return setting ? setting.value : defaultValue;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    fetchSettings,
    updateSetting,
    createSetting,
    getSetting,
    getSettingValue
  };
}