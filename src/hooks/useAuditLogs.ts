import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface AuditLog {
  id: string;
  created_at: string;
  action: string;
  table_name?: string | null;
  user_id?: string | null;
  record_id?: string | null;
  old_values?: any;
  new_values?: any;
  user_agent?: string | null;
  ip_address?: string | null;
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data || []) as AuditLog[]);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Erro ao carregar logs",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAuditLog = async (logData: {
    action: string;
    table_name?: string;
    record_id?: string;
    old_values?: any;
    new_values?: any;
  }) => {
    try {
      const { error } = await supabase.functions.invoke('create-audit-log', {
        body: logData
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error creating audit log:', error);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Set up real-time subscription for audit logs
    const channel = supabase
      .channel('audit_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          console.log('New audit log:', payload);
          fetchLogs(); // Refresh logs when new one is created
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    logs,
    loading,
    fetchLogs,
    createAuditLog
  };
}