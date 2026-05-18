import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createId, loadData, saveData } from '../lib/storage';
import type { AppData, Event, EventStatus, Task, TaskPriority, TaskStatus } from '../lib/types';

interface AppStoreContextValue {
  data: AppData;
  events: Event[];
  addEvent: (input: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Event;
  deleteEvent: (id: string) => void;
  getTasksForEvent: (eventId: string) => Task[];
  addTask: (
    eventId: string,
    input: { title: string; priority?: TaskPriority; category?: string }
  ) => Task;
  updateTask: (eventId: string, taskId: string, patch: Partial<Pick<Task, 'status' | 'title' | 'priority'>>) => void;
  deleteTask: (eventId: string, taskId: string) => void;
}

const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const events = useMemo(
    () => [...data.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [data.events]
  );

  const addEvent = useCallback(
    (input: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const event: Event = { ...input, id: createId(), createdAt: now, updatedAt: now };
      setData((prev) => ({ ...prev, events: [...prev.events, event] }));
      return event;
    },
    []
  );

  const deleteEvent = useCallback((id: string) => {
    setData((prev) => ({
      events: prev.events.filter((e) => e.id !== id),
      tasks: prev.tasks.filter((t) => t.eventId !== id),
    }));
  }, []);

  const getTasksForEvent = useCallback(
    (eventId: string) => data.tasks.filter((t) => t.eventId === eventId),
    [data.tasks]
  );

  const addTask = useCallback(
    (eventId: string, input: { title: string; priority?: TaskPriority; category?: string }) => {
      const now = new Date().toISOString();
      const task: Task = {
        id: createId(),
        eventId,
        title: input.title.trim(),
        status: 'todo',
        priority: input.priority ?? 'medium',
        category: input.category ?? 'General',
        createdAt: now,
        updatedAt: now,
      };
      setData((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
      return task;
    },
    []
  );

  const updateTask = useCallback(
    (eventId: string, taskId: string, patch: Partial<Pick<Task, 'status' | 'title' | 'priority'>>) => {
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId && t.eventId === eventId
            ? { ...t, ...patch, updatedAt: new Date().toISOString() }
            : t
        ),
      }));
    },
    []
  );

  const deleteTask = useCallback((eventId: string, taskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => !(t.id === taskId && t.eventId === eventId)),
    }));
  }, []);

  const value = useMemo(
    () => ({
      data,
      events,
      addEvent,
      deleteEvent,
      getTasksForEvent,
      addTask,
      updateTask,
      deleteTask,
    }),
    [data, events, addEvent, deleteEvent, getTasksForEvent, addTask, updateTask, deleteTask]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

export type { EventStatus, TaskStatus, TaskPriority };
