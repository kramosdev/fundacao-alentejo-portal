import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

export function RealTimeUpdates() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Set up real-time listeners for different tables
    const requestsChannel = supabase
      .channel('requests_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'requests'
        },
        (payload) => {
          console.log('New request created:', payload);
          toast({
            title: "Nova Requisição",
            description: "Uma nova requisição foi criada no sistema",
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests'
        },
        (payload) => {
          console.log('Request updated:', payload);
          toast({
            title: "Requisição Atualizada",
            description: "O status de uma requisição foi alterado",
            duration: 5000,
          });
        }
      )
      .subscribe((status) => {
        console.log('Requests channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    const incidentsChannel = supabase
      .channel('incidents_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incidents'
        },
        (payload) => {
          console.log('New incident created:', payload);
          toast({
            title: "Novo Incidente",
            description: "Um novo incidente foi reportado",
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'incidents'
        },
        (payload) => {
          console.log('Incident updated:', payload);
          toast({
            title: "Incidente Atualizado",
            description: "O status de um incidente foi alterado",
            duration: 5000,
          });
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('New notification:', payload);
          if (payload.new) {
            toast({
              title: payload.new.title || "Nova Notificação",
              description: payload.new.message || "Tem uma nova notificação",
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(incidentsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [toast]);

  // This component doesn't render anything visible, it's just for real-time functionality
  return null;
}