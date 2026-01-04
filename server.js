// Express server for Render deployment
// Handles SPA routing by serving index.html for all routes

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from build directory
app.use(express.static(join(__dirname, 'build'), {
  // Don't send 404 for missing files, let React Router handle it
  fallthrough: true
}));

// Handle React Router - serve index.html for all routes
// This ensures that routes like /dashboard, /monthly, etc. work correctly
app.get('*', (req, res) => {
  const indexPath = join(__dirname, 'build', 'index.html');
  
  if (existsSync(indexPath)) {
    try {
      const indexHtml = readFileSync(indexPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(indexHtml);
    } catch (error) {
      console.error('Error reading index.html:', error);
      res.status(500).send('Error loading application');
    }
  } else {
    console.error('index.html not found in build directory');
    res.status(500).send('Application not built correctly');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Serving files from: ${join(__dirname, 'build')}`);
});

