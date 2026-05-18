export type EventStatus = 'planning' | 'active' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime?: string;   // HH:mm format, e.g. "09:00"
  endTime?: string;     // HH:mm format, e.g. "17:00"
  description: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  events: Event[];
  tasks: Task[];
}
