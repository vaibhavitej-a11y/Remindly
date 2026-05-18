import { useState } from 'react';
import { Bell, BellOff, Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../hooks/useAppStore';
import {
  enableFullNotifications,
  getNotificationSupport,
  syncBackgroundNotifications,
} from '../lib/backgroundNotifications';

export default function NotificationSetup() {
  const { data } = useAppStore();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('remindly-notif-banner') === '1');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const support = getNotificationSupport();
  const permission =
    typeof Notification !== 'undefined' ? Notification.permission : 'denied';

  if (dismissed || (permission === 'granted' && support === 'full')) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    setStatus(null);
    const result = await enableFullNotifications(data);
    setLoading(false);

    if (result.permission !== 'granted') {
      setStatus('Permission blocked. Allow notifications in browser settings.');
      return;
    }
    if (result.support === 'full' && result.scheduled > 0) {
      setStatus(`${result.scheduled} reminders scheduled (work even when app is closed).`);
      sessionStorage.setItem('remindly-notif-banner', '1');
      setTimeout(() => setDismissed(true), 2500);
      return;
    }
    if (result.support === 'foreground-only') {
      setStatus('This browser only supports alerts while the app is open. Use Chrome on Android/desktop for full background alerts.');
      return;
    }
    setStatus('Notifications enabled for when the app is open.');
  };

  const handleResync = async () => {
    setLoading(true);
    const result = await syncBackgroundNotifications(data);
    setLoading(false);
    setStatus(
      result.scheduled > 0
        ? `Resynced ${result.scheduled} scheduled reminders.`
        : 'No upcoming reminders to schedule.'
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="bg-gradient-to-br from-[#3B82F6]/10 to-indigo-50 border border-[#3B82F6]/20 rounded-3xl p-5 space-y-4"
      >
        <motion.div layout className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-2xl flex items-center justify-center text-white shrink-0">
              {permission === 'denied' ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm">Background reminders</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Get notified when events are today, 1 hour before, and for urgent tasks — even when Remindly is closed.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('remindly-notif-banner', '1');
              setDismissed(true);
            }}
            className="p-1 text-slate-300 hover:text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>

        <ol className="text-[10px] font-bold uppercase tracking-widest text-slate-400 space-y-1.5 list-decimal list-inside">
          <li>Tap Enable below and choose Allow</li>
          <li className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> Install app: browser menu → Add to Home screen
          </li>
          <li>Best on Chrome (Android / desktop) — Safari on iPhone is limited</li>
        </ol>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || permission === 'denied'}
            onClick={handleEnable}
            className="px-5 py-2.5 bg-[#3B82F6] text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? 'Setting up…' : 'Enable notifications'}
          </button>
          {permission === 'granted' && (
            <button
              type="button"
              disabled={loading}
              onClick={handleResync}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600"
            >
              Resync
            </button>
          )}
        </div>

        {status && <p className="text-xs text-slate-600">{status}</p>}
      </motion.div>
    </AnimatePresence>
  );
}
