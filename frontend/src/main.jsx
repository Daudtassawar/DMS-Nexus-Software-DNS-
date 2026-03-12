import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply saved theme BEFORE first paint to avoid flash-of-wrong-theme
const savedTheme = localStorage.getItem('theme') || 'light';
const root = document.documentElement;
if (savedTheme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
} else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

