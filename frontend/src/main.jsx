// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { makeServer } from '../mirage/server';
import { seedJobs } from '../mirage/db';

async function main() {
  if (import.meta.env.DEV) {
    console.log("Setting up Mirage and seeding database...");
    await seedJobs();
    makeServer();
    console.log("Mirage server is ready.");
  }
  
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

main();