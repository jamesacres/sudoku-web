'use client';
import { useEffect, useRef } from 'react';

interface WakeLockSentinel {
  released: boolean;
  type: 'screen';
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
  removeEventListener(type: 'release', listener: () => void): void;
}

interface Navigator {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinel>;
  };
}

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = async () => {
    try {
      // Check if Wake Lock API is supported
      if ('wakeLock' in navigator) {
        const wakeLock = await (navigator as Navigator).wakeLock!.request(
          'screen'
        );
        wakeLockRef.current = wakeLock;
        console.info('Screen wake lock activated');

        // Listen for wake lock release (e.g., when tab becomes hidden)
        wakeLock.addEventListener('release', () => {
          console.info('Screen wake lock released');
          wakeLockRef.current = null;
        });

        return wakeLock;
      } else {
        console.warn('Wake Lock API not supported in this browser');
      }
    } catch (error) {
      console.error('Failed to activate screen wake lock:', error);
    }
    return null;
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.info('Screen wake lock manually released');
      } catch (error) {
        console.error('Failed to release screen wake lock:', error);
      }
    }
  };

  // Re-request wake lock when document becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        !window.document.hidden &&
        (!wakeLockRef.current || wakeLockRef.current?.released)
      ) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, []);

  return {
    requestWakeLock,
    releaseWakeLock,
    isActive: wakeLockRef.current && !wakeLockRef.current.released,
  };
}
