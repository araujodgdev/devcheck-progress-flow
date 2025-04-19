import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SupabaseContextType {
  isConnected: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Check connection
    async function checkConnection() {
      try {
        const { error } = await supabase.from('projects').select('id').limit(1);
        setIsConnected(!error);
      } catch (error) {
        setIsConnected(false);
      }
    }

    // Setup realtime
    const setupRealtime = () => {
      const newChannel = supabase.channel('devcheck-changes');
      setChannel(newChannel);
      
      newChannel
        .on('presence', { event: 'sync' }, () => {
          setIsConnected(true);
        })
        .on('presence', { event: 'join' }, () => {
          setIsConnected(true);
        })
        .on('presence', { event: 'leave' }, () => {
          // We're still connected, just tracking presence
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        });
    };

    checkConnection();
    setupRealtime();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ isConnected }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};