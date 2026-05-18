import { X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { PriorityItem } from '../lib/selectors';
import { formatPriorityLabel } from '../lib/selectors';

interface PriorityFeedModalProps {
  open: boolean;
  items: PriorityItem[];
  onClose: () => void;
  onSelectTask: (eventId: string, taskId: string) => void;
  onGoToProjects: () => void;
}

export default function PriorityFeedModal({
  open,
  items,
  onClose,
  onSelectTask,
  onGoToProjects,
}: PriorityFeedModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col overflow-hidden"
          >
            <motion.div layout className="p-8 pb-4 flex items-center justify-between shrink-0">
              <motion.div layout>
                <h3 className="text-2xl font-bold tracking-tight">Priority Feed</h3>
                <p className="text-sm text-slate-400 mt-1">Tap a task to open its project</p>
              </motion.div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </motion.div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3">
              {items.length > 0 ? (
                items.map(({ task, eventName }, index) => (
                  <motion.button
                    key={task.id}
                    type="button"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectTask(task.eventId, task.id);
                      onClose();
                    }}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all hover:shadow-md ${
                      task.priority === 'urgent'
                        ? 'bg-red-50/50 border-red-100 hover:border-red-200'
                        : task.priority === 'high'
                          ? 'bg-orange-50/30 border-orange-100 hover:border-orange-200'
                          : 'bg-white border-slate-100 hover:border-[#3B82F6]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          task.priority === 'urgent'
                            ? 'bg-red-500'
                            : task.priority === 'high'
                              ? 'bg-orange-500'
                              : 'bg-[#3B82F6]'
                        }`}
                      />
                      <motion.div layout className="min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                          {eventName} · {formatPriorityLabel(task.priority)}
                        </p>
                      </motion.div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </motion.button>
                ))
              ) : (
                <div className="py-12 text-center space-y-4">
                  <p className="text-slate-400">No pending tasks yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onGoToProjects();
                      onClose();
                    }}
                    className="px-6 py-3 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest"
                  >
                    Create a project
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
