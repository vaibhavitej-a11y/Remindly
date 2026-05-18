import React, { useState, useEffect } from 'react';
import { Plus, Calendar, CheckSquare, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppStoreProvider, useAppStore } from './hooks/useAppStore';
import EventDashboard from './components/EventDashboard';
import HomeView from './components/HomeView';
import CalendarView from './components/CalendarView';
import { requestNotificationPermission, startNotificationScheduler } from './lib/notifications';

function AppContent() {
  const { data } = useAppStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'settings'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    return startNotificationScheduler(() => data);
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col bg-[#FAFAFA] text-[#1A1A1A] font-sans overflow-hidden"
    >
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100 flex-shrink-0 z-50">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 bg-[#3B82F6] rounded-xl flex items-center justify-center text-white"
          >
            <CheckSquare className="w-5 h-5" />
          </motion.div>
          <span className="font-bold tracking-tight text-lg">Remindly</span>
        </motion.div>
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-2 rounded-full transition-colors ${activeTab === 'settings' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 relative max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6"
            >
              <HomeView
                onNavigateTasks={() => setActiveTab('tasks')}
                onNavigateCalendar={() => setActiveTab('settings')}
                onOpenTask={(eventId, taskId) => {
                  setActiveTab('tasks');
                  setTimeout(
                    () =>
                      window.dispatchEvent(
                        new CustomEvent('open-project', { detail: { eventId, taskId } })
                      ),
                    100
                  );
                }}
              />
            </motion.div>
          )}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <EventDashboard />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CalendarView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-8 flex items-center justify-around z-50 max-w-2xl mx-auto rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <NavButton
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
          icon={<Menu className="w-6 h-6" />}
          label="Home"
        />
        <NavButton
          active={activeTab === 'tasks'}
          onClick={() => setActiveTab('tasks')}
          icon={<CheckSquare className="w-6 h-6" />}
          label="Projects"
        />
        <div className="relative -top-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10"
          >
            <Plus className="w-8 h-8" />
          </motion.button>
        </div>
        <NavButton
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
          icon={<Calendar className="w-6 h-6" />}
          label="Calendar"
        />
      </nav>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-white/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden p-8"
            >
              <div className="space-y-6">
                <header className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight">Quick Add</h3>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                </header>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <motion.button
                    variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                    onClick={() => {
                      setActiveTab('tasks');
                      setShowAddModal(false);
                      setTimeout(() => window.dispatchEvent(new CustomEvent('open-project-modal')), 100);
                    }}
                    className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl hover:bg-[#3B82F6]/5 hover:text-[#3B82F6] transition-all group"
                  >
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-blue-100"
                    >
                      <CheckSquare className="w-6 h-6" />
                    </motion.div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">New Project</span>
                  </motion.button>
                  <motion.button
                    variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                    onClick={() => {
                      setActiveTab('settings');
                      setShowAddModal(false);
                      setTimeout(() => window.dispatchEvent(new CustomEvent('open-event-modal')), 100);
                    }}
                    className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl hover:bg-[#3B82F6]/5 hover:text-[#3B82F6] transition-all group"
                  >
                    <motion.div
                      whileHover={{ rotate: -5 }}
                      className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-blue-100"
                    >
                      <Calendar className="w-6 h-6" />
                    </motion.div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">New Event</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NavButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-[#3B82F6]' : 'text-slate-300 hover:text-slate-500'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </motion.button>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <AppContent />
    </AppStoreProvider>
  );
}
