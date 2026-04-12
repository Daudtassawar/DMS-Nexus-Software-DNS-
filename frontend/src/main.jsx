import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

/**
 * CONFIGURATION:
 * Public Render URL for the backend API.
 */
const API_BASE_URL = 'https://dms-nexus-software-dns.onrender.com';
axios.defaults.baseURL = API_BASE_URL;

console.log(`[DEBUG] main.jsx: API Base URL set to ${axios.defaults.baseURL}`);

// Apply saved theme safely
try {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const root = document.documentElement;
    if (savedTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
    } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
    }
} catch (e) {
    console.error('Theme initialization failed:', e);
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          margin: '2rem',
          borderRadius: '8px',
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#991B1B', 
          fontFamily: 'system-ui, sans-serif' 
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Application Crash Detected</h1>
          <p style={{ marginBottom: '1rem' }}>The system encountered a runtime error and could not render the UI.</p>
          <div style={{ 
            background: '#FFF', 
            padding: '1rem', 
            borderRadius: '4px', 
            border: '1px solid #FECACA',
            overflowX: 'auto',
            fontSize: '0.875rem'
          }}>
            <pre style={{ margin: 0 }}>{this.state.error?.toString()}</pre>
            <pre style={{ marginTop: '0.5rem', opacity: 0.7, fontSize: '0.75rem' }}>{this.state.error?.stack}</pre>
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{
              marginTop: '1.5rem',
              padding: '0.5rem 1rem',
              background: '#991B1B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Clear Cache & Reload System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        throw new Error("Could not find root element with id 'root'");
    }
    
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    );
    console.log("App Initialization Successful");
} catch (e) {
    console.error('Final App Mounting Failed:', e);
    document.body.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif; text-align: center;">
            <h1 style="color: #dc2626;">Critical System Load Failure</h1>
            <p>The bootstrap script crashed before the application could start.</p>
            <pre style="text-align: left; background: #f1f5f9; padding: 20px; display: inline-block;">${e.message}</pre>
            <br/><br/>
            <button onclick="localStorage.clear(); location.reload();" style="padding: 10px 20px; cursor: pointer;">Reset System Storage</button>
        </div>
    `;
}
