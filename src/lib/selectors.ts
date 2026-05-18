import { isSameDay, startOfDay } from 'date-fns';
import type { AppData, Event, Task, TaskPriority } from './types';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function sortEventsByDate(events: Event[]): Event[] {
  return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getTasksForEvent(data: AppData, eventId: string): Task[] {
  return data.tasks.filter((t) => t.eventId === eventId);
}

export function getPendingTaskCount(data: AppData): number {
  return data.tasks.filter((t) => t.status !== 'completed').length;
}

export function getEventsDueTodayCount(data: AppData): number {
  const today = startOfDay(new Date());
  return data.events.filter((e) => isSameDay(new Date(e.date), today)).length;
}

export function getUpcomingEvents(data: AppData, limit = 2): Event[] {
  const now = startOfDay(new Date());
  return sortEventsByDate(data.events)
    .filter((e) => new Date(e.date) >= now)
    .slice(0, limit);
}

export interface PriorityItem {
  task: Task;
  eventName: string;
}

function buildPriorityItems(data: AppData, tasks: Task[]): PriorityItem[] {
  const eventMap = new Map(data.events.map((e) => [e.id, e.name]));
  return tasks.map((task) => ({
    task,
    eventName: eventMap.get(task.eventId) ?? 'Project',
  }));
}

export function getPendingTasksSorted(data: AppData): Task[] {
  return data.tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

export function getPriorityFeed(data: AppData, limit = 5): PriorityItem[] {
  return buildPriorityItems(data, getPendingTasksSorted(data).slice(0, limit));
}

export function getAllPriorityItems(data: AppData): PriorityItem[] {
  return buildPriorityItems(data, getPendingTasksSorted(data));
}

export function formatPriorityLabel(priority: TaskPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
