import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function prepareApp(): Promise<void> {
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
  }
}

prepareApp().then(() => {
  const root = document.getElementById('root');
  if (!root) {
    document.body.innerHTML =
      '<p style="font-family:sans-serif;padding:24px">Remindly failed to mount. Check the console.</p>';
    return;
  }

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
