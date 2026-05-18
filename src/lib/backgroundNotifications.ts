import { buildNotificationPlan } from './buildNotificationPlan';
import type { AppData } from './types';

export type NotificationSupport = 'full' | 'foreground-only' | 'denied' | 'unsupported';

export function getNotificationSupport(): NotificationSupport {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  if ('TimestampTrigger' in window && 'serviceWorker' in navigator) return 'full';
  return 'foreground-only';
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

async function waitForServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export async function syncBackgroundNotifications(data: AppData): Promise<{
  support: NotificationSupport;
  scheduled: number;
}> {
  const support = getNotificationSupport();
  if (Notification.permission !== 'granted') {
    return { support, scheduled: 0 };
  }

  const plans = buildNotificationPlan(data);
  const reg = await waitForServiceWorker();

  if (!reg?.active) {
    return { support, scheduled: 0 };
  }

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      const result = event.data as { scheduled?: number; supported?: boolean };
      resolve({
        support: result.supported ? 'full' : 'foreground-only',
        scheduled: result.scheduled ?? 0,
      });
    };

    reg.active!.postMessage({ type: 'SYNC_NOTIFICATIONS', plans }, [channel.port2]);

    setTimeout(() => resolve({ support, scheduled: 0 }), 3000);
  });
}

export async function enableFullNotifications(data: AppData): Promise<{
  permission: NotificationPermission;
  support: NotificationSupport;
  scheduled: number;
}> {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return { permission, support: getNotificationSupport(), scheduled: 0 };
  }
  const { support, scheduled } = await syncBackgroundNotifications(data);
  return { permission, support, scheduled };
}
