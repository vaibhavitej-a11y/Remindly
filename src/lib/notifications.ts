import { isSameDay, differenceInMinutes, parseISO, startOfDay } from 'date-fns';
import type { AppData, Event, Task } from './types';

const CHECK_INTERVAL_MS = 60_000;

function canNotify(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
}

function markNotified(key: string): void {
  sessionStorage.setItem(key, '1');
}

function wasNotified(key: string): boolean {
  return sessionStorage.getItem(key) === '1';
}

function notify(title: string, body: string): void {
  if (!canNotify()) return;
  const tag = `${title}-${body}`.slice(0, 32);
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, { body, tag, icon: '/icon.svg' });
      });
    } else {
      new Notification(title, { body, tag, icon: '/icon.svg' });
    }
  } catch {
    // Notification not supported in this context — non-fatal
  }
}

export function checkEventNotifications(events: Event[]): void {
  if (!canNotify()) return;

  const now = new Date();
  const today = startOfDay(now);

  events.forEach((event) => {
    const time = event.startTime || '09:00';
    const eventDate = parseISO(event.date.includes('T') ? event.date : `${event.date}T${time}:00`);

    if (isSameDay(eventDate, today)) {
      const key = `remindly-event-today-${event.id}-${event.date}`;
      if (!wasNotified(key)) {
        notify('Event today', `"${event.title}" is scheduled for today.`);
        markNotified(key);
      }
    }

    const minutesUntil = differenceInMinutes(eventDate, now);
    if (minutesUntil > 0 && minutesUntil <= 60) {
      const key = `remindly-event-soon-${event.id}-${event.date}`;
      if (!wasNotified(key)) {
        notify('Event starting soon', `"${event.title}" is in about ${minutesUntil} minutes.`);
        markNotified(key);
      }
    }
  });
}

export function checkTaskNotifications(data: AppData): void {
  if (!canNotify()) return;

  const eventMap = new Map(data.events.map((e) => [e.id, e.title]));

  data.tasks
    .filter((t) => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high'))
    .forEach((task) => {
      const key = `remindly-task-live-${task.id}-${task.priority}`;
      if (wasNotified(key)) return;
      const project = eventMap.get(task.eventId) ?? 'a project';
      notify(
        task.priority === 'urgent' ? 'Urgent task' : 'High-priority task',
        `"${task.title}" in ${project}`
      );
      markNotified(key);
    });
}

export function runForegroundNotificationChecks(data: AppData): void {
  checkEventNotifications(data.events);
  checkTaskNotifications(data);
}

export function startForegroundNotificationScheduler(getData: () => AppData): () => void {
  const tick = () => runForegroundNotificationChecks(getData());
  tick();
  const id = window.setInterval(tick, CHECK_INTERVAL_MS);
  return () => window.clearInterval(id);
}
