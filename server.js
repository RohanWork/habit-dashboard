// Simple static file server for Render deployment
// This is optional - Render static sites don't need this
// Only use if deploying as a Web Service instead of Static Site

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from build directory
app.use(express.static(join(__dirname, 'build')));

// Handle React Router - serve index.html for all routes
app.get('*', (req, res) => {
  try {
    const indexHtml = readFileSync(join(__dirname, 'build', 'index.html'), 'utf8');
    res.send(indexHtml);
  } catch (error) {
    res.status(500).send('Error loading application');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

