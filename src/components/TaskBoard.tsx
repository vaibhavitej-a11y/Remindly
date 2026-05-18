import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import type { Event, Task } from '../lib/types';
import { ArrowLeft, Plus, CheckCircle2, Trash2, CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function TaskBoard({
  event,
  onBack,
  highlightTaskId,
}: {
  event: Event;
  onBack: () => void;
  highlightTaskId?: string | null;
}) {
  const { getTasksForEvent, addTask, updateTask, deleteTask } = useAppStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');

  const tasks = getTasksForEvent(event.id);
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!highlightTaskId) return;
    const el = taskRefs.current[highlightTaskId];
    if (!el) return;
    const timer = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    return () => clearTimeout(timer);
  }, [highlightTaskId, tasks.length]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(event.id, { title: newTaskTitle, priority: newTaskPriority });
    setNewTaskTitle('');
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    updateTask(event.id, task.id, { status: newStatus });
  };

  return (
    <div className="p-6 space-y-10">
      <header className="flex items-center justify-between max-w-2xl mx-auto w-full">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div className="text-center">
          <h1 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Plan</h1>
          <p className="font-bold truncate max-w-[200px]">{event.title}</p>
        </div>
        <motion.div layout className="w-9" />
      </header>

      <div className="max-w-xl mx-auto w-full space-y-3">
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 ml-2">
            <Plus className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a task..."
            className="flex-1 bg-transparent py-4 font-medium text-slate-900 outline-none placeholder:text-slate-300"
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-transparent outline-none mr-2"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          {newTaskTitle && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleAddTask}
              className="bg-black text-white px-6 h-10 rounded-2xl text-xs font-bold uppercase tracking-widest mr-1"
            >
              Add
            </motion.button>
          )}
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
        }}
        className="max-w-xl mx-auto w-full space-y-2"
      >
        {tasks.map((task) => {
          const isHighlighted = highlightTaskId === task.id;
          return (
          <motion.div
            layout
            key={task.id}
            ref={(el) => {
              taskRefs.current[task.id] = el;
            }}
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            animate={
              isHighlighted
                ? {
                    boxShadow: [
                      '0 0 0 0px rgba(59, 130, 246, 0)',
                      '0 0 0 3px rgba(59, 130, 246, 0.4)',
                      '0 0 0 0px rgba(59, 130, 246, 0)',
                    ],
                  }
                : {}
            }
            transition={isHighlighted ? { duration: 1.2, repeat: 2 } : {}}
            className={`group bg-white p-5 rounded-3xl border flex items-center gap-4 transition-all ${
              isHighlighted ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/20' : 'border-slate-50'
            } ${task.status === 'completed' ? 'opacity-40' : ''}`}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleTaskStatus(task)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                task.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'border-2 border-slate-100 hover:border-[#3B82F6]'
              }`}
            >
              {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
            </motion.button>

            <div className="flex-1 min-w-0">
              <p
                className={`font-medium text-sm ${
                  task.status === 'completed' ? 'line-through text-slate-400' : ''
                }`}
              >
                {task.title}
              </p>
              <motion.div layout className="flex items-center gap-3 mt-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    task.priority === 'urgent'
                      ? 'text-red-500'
                      : task.priority === 'high'
                        ? 'text-orange-500'
                        : 'text-[#3B82F6]'
                  }`}
                >
                  {task.priority}
                </span>
                {task.category && (
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                    {task.category}
                  </span>
                )}
              </motion.div>
            </div>

            <button
              onClick={() => deleteTask(event.id, task.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-200 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        );
        })}

        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4"
            >
              <CheckSquare className="w-8 h-8 text-slate-200" />
            </motion.div>
            <p className="text-slate-400 font-medium italic">Empty list. Fresh start.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
