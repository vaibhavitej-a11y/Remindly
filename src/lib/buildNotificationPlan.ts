import { addHours, parseISO, setHours, setMinutes, startOfDay, subHours } from 'date-fns';
import type { AppData } from './types';

export interface ScheduledNotification {
  tag: string;
  title: string;
  body: string;
  timestamp: number;
}

const MAX_SCHEDULED = 55;

function parseEventDateTime(dateStr: string, startTime?: string): Date {
  if (dateStr.includes('T')) return parseISO(dateStr);
  const time = startTime || '09:00';
  return parseISO(`${dateStr}T${time}:00`);
}

function nextNineAm(from: Date): Date {
  const candidate = setMinutes(setHours(startOfDay(from), 9), 0);
  if (candidate <= from) {
    return setMinutes(setHours(startOfDay(addHours(from, 24)), 9), 0);
  }
  return candidate;
}

export function buildNotificationPlan(data: AppData, now = new Date()): ScheduledNotification[] {
  const plans: ScheduledNotification[] = [];
  const nowMs = now.getTime();
  const eventNames = new Map(data.events.map((e) => [e.id, e.title]));

  for (const event of data.events) {
    const at = parseEventDateTime(event.date, event.startTime);
    if (at.getTime() <= nowMs) continue;

    plans.push({
      tag: `remindly-event-${event.id}`,
      title: 'Event reminder',
      body: `"${event.title}" starts now.`,
      timestamp: at.getTime(),
    });

    const oneHourBefore = subHours(at, 1);
    if (oneHourBefore.getTime() > nowMs) {
      plans.push({
        tag: `remindly-event-${event.id}-1h`,
        title: 'Event in 1 hour',
        body: `"${event.title}" is coming up soon.`,
        timestamp: oneHourBefore.getTime(),
      });
    }

    const morning = setMinutes(setHours(startOfDay(at), 8), 0);
    if (morning.getTime() > nowMs && morning.getTime() < at.getTime()) {
      plans.push({
        tag: `remindly-event-${event.id}-am`,
        title: 'Event today',
        body: `"${event.title}" is scheduled for today.`,
        timestamp: morning.getTime(),
      });
    }
  }

  for (const task of data.tasks) {
    if (task.status === 'completed') continue;
    if (task.priority !== 'urgent' && task.priority !== 'high') continue;

    const when = nextNineAm(now);
    if (when.getTime() <= nowMs) continue;

    const project = eventNames.get(task.eventId) ?? 'your project';
    plans.push({
      tag: `remindly-task-${task.id}`,
      title: task.priority === 'urgent' ? 'Urgent task' : 'High-priority task',
      body: `"${task.title}" in ${project}`,
      timestamp: when.getTime(),
    });
  }

  return plans
    .filter((p) => p.timestamp > nowMs)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, MAX_SCHEDULED);
}
