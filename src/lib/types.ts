export type EventStatus = 'planning' | 'active' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
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
