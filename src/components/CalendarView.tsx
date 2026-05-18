import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../hooks/useAppStore';

export default function CalendarView() {
  const { events, addEvent } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const handleGlobalTrigger = () => setShowCreateModal(true);
    window.addEventListener('open-event-modal', handleGlobalTrigger);
    return () => window.removeEventListener('open-event-modal', handleGlobalTrigger);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addEvent({
      name: String(formData.get('name')),
      date: String(formData.get('date')),
      location: String(formData.get('location')),
      description: '',
      status: 'active',
    });
    setShowCreateModal(false);
  };

  const selectedDayEvents = events.filter((ev) => isSameDay(new Date(ev.date), selectedDate));

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{format(currentDate, 'MMMM')}</h1>
          <p className="text-slate-400 font-medium">{format(currentDate, 'yyyy')}</p>
        </div>
        <div className="flex bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={prevMonth}
            className="p-3 hover:bg-slate-50 transition-colors border-r border-slate-100 text-slate-400 hover:text-black"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 hover:bg-slate-50 transition-colors border-r border-slate-100 text-[#3B82F6] font-bold text-xs"
          >
            ADD
          </button>
          <button
            onClick={nextMonth}
            className="p-3 hover:bg-slate-50 transition-colors text-slate-400 hover:text-black"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <motion.div
            key={`${day}-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.02 }}
            className="text-[10px] font-bold text-slate-300 text-center py-2 uppercase tracking-widest"
          >
            {day}
          </motion.div>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const hasEvents = events.some((ev) => isSameDay(new Date(ev.date), day));

          return (
            <motion.button
              key={day.toISOString()}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(day)}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-black text-white shadow-xl shadow-black/10'
                  : isToday
                    ? 'bg-blue-50 text-[#3B82F6]'
                    : isCurrentMonth
                      ? 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-100'
                      : 'bg-transparent text-slate-200'
              }`}
            >
              <span className="text-sm font-bold">{format(day, 'd')}</span>
              {isToday && !isSelected && (
                <div className="absolute bottom-2 w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
              )}
              {hasEvents && !isSelected && !isToday && (
                <motion.div
                  layout
                  className="absolute bottom-2 w-1.5 h-1.5 bg-slate-300 rounded-full"
                />
              )}
              {hasEvents && isSelected && (
                <div className="absolute bottom-2 w-1.5 h-1.5 bg-white/40 rounded-full" />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      <section className="space-y-4 pt-6 pb-12">
        <h2 className="font-bold uppercase tracking-[0.15em] text-xs text-slate-400">
          Agenda: {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'MMM d')}
        </h2>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
          }}
          className="space-y-3"
        >
          {selectedDayEvents.map((event) => (
            <motion.div
              key={event.id}
              variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
              className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 group"
            >
              <motion.div
                layout
                className="w-1 h-8 bg-[#3B82F6] rounded-full group-hover:scale-y-125 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate">{event.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>
              </div>
            </motion.div>
          ))}

          {selectedDayEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-100"
            >
              <Clock className="w-6 h-6 text-slate-200 mb-2" />
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                No plans for this day
              </p>
            </motion.div>
          )}
        </motion.div>
      </section>

      <AnimatePresence>
        {showCreateModal && (
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
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-white/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <header className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight">New Event</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-50 rounded-xl">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </header>

                <form onSubmit={handleAddEvent} className="space-y-4">
                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="Event Name"
                    className="w-full px-6 py-5 bg-slate-50/50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-[#3B82F6] font-medium"
                  />
                  <input
                    required
                    name="location"
                    type="text"
                    placeholder="Location"
                    className="w-full px-6 py-5 bg-slate-50/50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-[#3B82F6] font-medium"
                  />
                  <input
                    required
                    name="date"
                    type="date"
                    defaultValue={format(selectedDate, 'yyyy-MM-dd')}
                    className="w-full px-6 py-5 bg-slate-50/50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-[#3B82F6] font-medium"
                  />
                  <button
                    type="submit"
                    className="w-full py-5 bg-black text-white rounded-[32px] font-bold text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-slate-800 transition-colors"
                  >
                    Save Event
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
