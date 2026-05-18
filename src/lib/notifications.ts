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
  new Notification(title, { body, tag: `${title}-${body}`.slice(0, 32) });
}

export function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function checkEventNotifications(events: Event[]): void {
  if (!canNotify()) return;

  const now = new Date();
  const today = startOfDay(now);

  events.forEach((event) => {
    const eventDate = parseISO(event.date.includes('T') ? event.date : `${event.date}T09:00:00`);

    if (isSameDay(eventDate, today)) {
      const key = `remindly-event-today-${event.id}-${event.date}`;
      if (!wasNotified(key)) {
        notify('Event today', `"${event.name}" is scheduled for today.`);
        markNotified(key);
      }
    }

    const minutesUntil = differenceInMinutes(eventDate, now);
    if (minutesUntil > 0 && minutesUntil <= 60) {
      const key = `remindly-event-soon-${event.id}-${event.date}`;
      if (!wasNotified(key)) {
        notify('Event starting soon', `"${event.name}" is in about ${minutesUntil} minutes.`);
        markNotified(key);
      }
    }
  });
}

export function checkTaskNotifications(data: AppData): void {
  if (!canNotify()) return;

  const eventMap = new Map(data.events.map((e) => [e.id, e.name]));

  data.tasks
    .filter((t) => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high'))
    .forEach((task) => {
      const key = `remindly-task-${task.id}-${task.priority}`;
      if (wasNotified(key)) return;
      const project = eventMap.get(task.eventId) ?? 'a project';
      notify(
        task.priority === 'urgent' ? 'Urgent task' : 'High-priority task',
        `"${task.title}" in ${project}`
      );
      markNotified(key);
    });
}

export function runNotificationChecks(data: AppData): void {
  checkEventNotifications(data.events);
  checkTaskNotifications(data);
}

export function startNotificationScheduler(getData: () => AppData): () => void {
  const tick = () => runNotificationChecks(getData());
  tick();
  const id = window.setInterval(tick, CHECK_INTERVAL_MS);
  return () => window.clearInterval(id);
}
