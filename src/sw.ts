/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import type { ScheduledNotification } from './lib/buildNotificationPlan';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

precacheAndRoute(self.__WB_MANIFEST);

const TAGS_KEY = 'remindly-scheduled-tags';

async function readStoredTags(): Promise<string[]> {
  try {
    const cache = await caches.open('remindly-meta');
    const res = await cache.match(TAGS_KEY);
    if (!res) return [];
    return (await res.json()) as string[];
  } catch {
    return [];
  }
}

async function writeStoredTags(tags: string[]): Promise<void> {
  const cache = await caches.open('remindly-meta');
  await cache.put(TAGS_KEY, new Response(JSON.stringify(tags)));
}

async function clearScheduledNotifications(): Promise<void> {
  const tags = await readStoredTags();
  for (const tag of tags) {
    const list = await self.registration.getNotifications({ tag });
    for (const n of list) n.close();
  }
  await writeStoredTags([]);
}

async function scheduleNotifications(plans: ScheduledNotification[]): Promise<{ scheduled: number; supported: boolean }> {
  await clearScheduledNotifications();

  const TimestampTriggerCtor = (self as unknown as { TimestampTrigger?: typeof TimestampTrigger }).TimestampTrigger;
  if (!TimestampTriggerCtor) {
    return { scheduled: 0, supported: false };
  }

  const scheduledTags: string[] = [];
  const now = Date.now();

  for (const plan of plans) {
    if (plan.timestamp <= now) continue;
    try {
      await self.registration.showNotification(plan.title, {
        body: plan.body,
        tag: plan.tag,
        icon: '/icon.svg',
        badge: '/icon.svg',
        data: { tag: plan.tag },
        showTrigger: new TimestampTriggerCtor(plan.timestamp),
      } as NotificationOptions);
      scheduledTags.push(plan.tag);
    } catch {
      // Skip invalid or duplicate schedules
    }
  }

  await writeStoredTags(scheduledTags);
  return { scheduled: scheduledTags.length, supported: true };
}

self.addEventListener('message', (event) => {
  const msg = event.data as { type?: string; plans?: ScheduledNotification[] };
  if (msg?.type === 'SYNC_NOTIFICATIONS' && Array.isArray(msg.plans)) {
    event.waitUntil(
      scheduleNotifications(msg.plans).then((result) => {
        event.ports[0]?.postMessage(result);
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
