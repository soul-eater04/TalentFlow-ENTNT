// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { makeServer } from '../mirage/server';
import { seedCandidates, seedJobs } from '../mirage/db';
import { ThemeProvider } from './context/ThemeProvider';

async function main() {
  console.log("Setting up Mirage and seeding database...");
  await seedJobs();
  await seedCandidates();
  makeServer();
  console.log("Mirage server is ready.");
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
}

main();