import { useState } from 'react';
import { CheckSquare, Bell, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../hooks/useAppStore';
import {
  getEventsDueTodayCount,
  getPendingTaskCount,
  getPriorityFeed,
  getAllPriorityItems,
  getUpcomingEvents,
  formatPriorityLabel,
} from '../lib/selectors';
import PriorityFeedModal from './PriorityFeedModal';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeView({
  onNavigateTasks,
  onNavigateCalendar,
  onOpenTask,
}: {
  onNavigateTasks: () => void;
  onNavigateCalendar: () => void;
  onOpenTask: (eventId: string, taskId: string) => void;
}) {
  const { data } = useAppStore();
  const [showPriorityFeed, setShowPriorityFeed] = useState(false);

  const pendingCount = getPendingTaskCount(data);
  const dueTodayCount = getEventsDueTodayCount(data);
  const upcomingEvents = getUpcomingEvents(data, 2);
  const priorityFeed = getPriorityFeed(data, 5);
  const allPriorityItems = getAllPriorityItems(data);
  const hasMorePriority = allPriorityItems.length > priorityFeed.length;

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <p className="text-slate-400 font-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}</h1>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => setShowPriorityFeed(true)}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 text-left"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"
          >
            <CheckSquare className="w-5 h-5" />
          </motion.div>
          <motion.div key={pendingCount} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tasks Pending</p>
          </motion.div>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={onNavigateCalendar}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 text-right items-end"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"
          >
            <Clock className="w-5 h-5" />
          </motion.div>
          <motion.div key={dueTodayCount} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-2xl font-bold">{dueTodayCount}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Due Today</p>
          </motion.div>
        </motion.button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold uppercase tracking-[0.15em] text-xs text-slate-400">Priority Feed</h2>
          <div className="flex items-center gap-3">
            {allPriorityItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPriorityFeed(true)}
                className="text-xs font-bold text-[#3B82F6] flex items-center gap-1"
              >
                See all <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPriorityFeed(true)}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Open priority feed"
            >
              <Bell className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
          }}
          className="space-y-3"
        >
          {priorityFeed.length > 0 ? (
            <>
              {priorityFeed.map(({ task, eventName }) => (
                <motion.div
                  key={task.id}
                  variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
                >
                  <ReminderItem
                    type={
                      task.priority === 'urgent' ? 'urgent' : task.priority === 'high' ? 'high' : 'normal'
                    }
                    label={task.title}
                    time={`${eventName} · ${formatPriorityLabel(task.priority)}`}
                    onClick={() => onOpenTask(task.eventId, task.id)}
                  />
                </motion.div>
              ))}
              {hasMorePriority && (
                <button
                  type="button"
                  onClick={() => setShowPriorityFeed(true)}
                  className="w-full py-3 text-xs font-bold uppercase tracking-widest text-[#3B82F6] hover:bg-blue-50/50 rounded-2xl transition-colors"
                >
                  +{allPriorityItems.length - priorityFeed.length} more tasks
                </button>
              )}
            </>
          ) : (
            <div className="py-6 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
              <p className="text-sm text-slate-400">No pending tasks yet.</p>
              <button
                type="button"
                onClick={onNavigateTasks}
                className="text-xs font-bold uppercase tracking-widest text-[#3B82F6]"
              >
                Add tasks in Projects
              </button>
            </div>
          )}
        </motion.div>
      </section>

      <section className="space-y-4">
        <motion.div layout className="flex items-center justify-between">
          <h2 className="font-bold uppercase tracking-[0.15em] text-xs text-slate-400">Upcoming Events</h2>
          <button onClick={onNavigateCalendar} className="text-xs font-bold text-[#3B82F6] flex items-center gap-1">
            Calendar <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="space-y-4"
        >
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.01 }}
                onClick={onNavigateTasks}
                className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 3 }}
                  className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold leading-none tracking-tighter">
                    {new Date(event.date).getDate()}
                  </span>
                </motion.div>
                <motion.div layout className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">{event.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{event.location}</p>
                </motion.div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-slate-400 italic py-4">No events scheduled. Time to plan something.</p>
          )}
        </motion.div>
      </section>

      <PriorityFeedModal
        open={showPriorityFeed}
        items={allPriorityItems}
        onClose={() => setShowPriorityFeed(false)}
        onSelectTask={onOpenTask}
        onGoToProjects={onNavigateTasks}
      />
    </div>
  );
}

function ReminderItem({
  type,
  label,
  time,
  onClick,
}: {
  type: 'urgent' | 'high' | 'normal';
  label: string;
  time: string;
  onClick: () => void;
}) {
  const styles =
    type === 'urgent'
      ? 'bg-red-50/50 border-red-100 hover:border-red-200'
      : type === 'high'
        ? 'bg-orange-50/30 border-orange-100 hover:border-orange-200'
        : 'bg-white border-slate-100 hover:border-[#3B82F6]/30';

  return (
    <motion.button
      type="button"
      whileHover={{ x: 2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer hover:shadow-md text-left ${styles}`}
    >
      <motion.div layout className="flex items-center gap-3 min-w-0">
        <motion.div
          animate={type === 'urgent' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: type === 'urgent' ? Infinity : 0, duration: 1.5 }}
          className={`w-2 h-2 rounded-full shrink-0 ${
            type === 'urgent' ? 'bg-red-500' : type === 'high' ? 'bg-orange-500' : 'bg-[#3B82F6]'
          }`}
        />
        <span className="text-sm font-medium truncate">{label}</span>
      </motion.div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2 shrink-0 flex items-center gap-1">
        {time}
        <ArrowRight className="w-3 h-3 opacity-50" />
      </span>
    </motion.button>
  );
}
