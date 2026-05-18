import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Calendar, Trash2, ChevronRight, Plus, X, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TaskBoard from './TaskBoard';

export default function EventDashboard() {
  const { events, addEvent, deleteEvent } = useAppStore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const handleGlobalTrigger = () => setShowCreateModal(true);
    const handleOpenProject = (e: Event) => {
      const detail = (e as CustomEvent<{ eventId: string; taskId?: string }>).detail;
      if (!detail?.eventId) return;
      setSelectedEventId(detail.eventId);
      setHighlightTaskId(detail.taskId ?? null);
    };
    window.addEventListener('open-project-modal', handleGlobalTrigger);
    window.addEventListener('open-project', handleOpenProject);
    return () => {
      window.removeEventListener('open-project-modal', handleGlobalTrigger);
      window.removeEventListener('open-project', handleOpenProject);
    };
  }, []);

  const handleDeleteEvent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project? All its tasks will be removed.')) {
      deleteEvent(id);
      if (selectedEventId === id) setSelectedEventId(null);
    }
  };

  if (selectedEventId) {
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) {
      setSelectedEventId(null);
      return null;
    }
    return (
      <TaskBoard
        event={event}
        highlightTaskId={highlightTaskId}
        onBack={() => {
          setSelectedEventId(null);
          setHighlightTaskId(null);
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-slate-400 font-medium">Manage your focus areas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-slate-100"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-6"
          >
            <Calendar className="w-8 h-8 text-slate-200" />
          </motion.div>
          <h3 className="font-bold tracking-tight text-lg mb-2">No projects yet</h3>
          <p className="text-slate-400 text-sm max-w-[200px] text-center mb-8">
            Create a project to organize your related tasks.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 bg-[#3B82F6] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
          >
            Get Started
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
          className="space-y-4"
        >
          {events.map((event) => (
            <motion.div
              key={event.id}
              variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedEventId(event.id)}
              className="group bg-white p-6 rounded-[32px] border border-slate-50 hover:border-[#3B82F6]/20 hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer flex items-center gap-6"
            >
              <motion.div
                whileHover={{ rotate: 5 }}
                className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-[#3B82F6]/5 transition-colors"
              >
                <CheckSquare className="w-6 h-6 text-slate-300 group-hover:text-[#3B82F6] transition-colors" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg tracking-tight truncate">{event.name}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{event.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDeleteEvent(e, event.id)}
                  className="p-2 text-slate-100 hover:text-red-500 group-hover:text-slate-200 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 rounded-full border border-slate-50 flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-white/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <header className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight">New Project</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-50 rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                </header>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addEvent({
                      name: String(formData.get('name')),
                      date: String(formData.get('date')),
                      location: String(formData.get('location')),
                      description: '',
                      status: 'planning',
                    });
                    setShowCreateModal(false);
                  }}
                  className="space-y-4"
                >
                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="Project Name"
                    className="w-full px-6 py-5 bg-slate-50/50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-[#3B82F6] font-medium"
                  />
                  <input
                    required
                    name="location"
                    type="text"
                    placeholder="Category (e.g. Work, Health)"
                    className="w-full px-6 py-5 bg-slate-50/50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-[#3B82F6] font-medium"
                  />
                  <input
                    required
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full px-6 py-5 bg-slate-50/50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-[#3B82F6] font-medium"
                  />
                  <button
                    type="submit"
                    className="w-full py-5 bg-black text-white rounded-[32px] font-bold text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-slate-800 transition-colors"
                  >
                    Create Workspace
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
