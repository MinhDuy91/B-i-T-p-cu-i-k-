/**
 * Hook useNetworkStatus — theo dõi trạng thái mạng (online/offline).
 * Hiển thị banner cảnh báo khi mất mạng.
 */
import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkNetwork = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (mounted) {
          const connected = state.isConnected ?? false;
          setIsOnline(connected);
          if (connected) {
            setLastOnlineAt(new Date());
          }
        }
      } catch {
        if (mounted) {
          setIsOnline(false);
        }
      }
    };

    // Kiểm tra ngay khi mount
    checkNetwork();

    // Kiểm tra định kỳ mỗi 10 giây
    const interval = setInterval(checkNetwork, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { isOnline, lastOnlineAt };
}
