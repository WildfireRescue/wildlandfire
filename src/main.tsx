import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './app/App'
import './styles/index.css'

// ── User Timing: mark the start of React initialisation ────────────────────
// 'html-parsed' is set in index.html <head> (earliest possible point).
// 'react-init'  is set here — covers module evaluation time.
// 'app-mounted' is set after createRoot().render() returns.
// Use PerformanceObserver({ type:'measure' }) or DevTools to read them.
performance?.mark('react-init');

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

performance?.mark('app-mounted');
