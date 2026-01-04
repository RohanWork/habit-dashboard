# Render Deployment Guide

This guide explains how to deploy the Habit Dashboard to Render.

## Configuration Files

### render.yaml
This file contains the Render service configuration. The app is configured as a **Web Service** that:
- Builds the project using `npm install && npm run build`
- Serves the built files from the `build` directory using Express server
- The `server.js` file handles all routes properly for SPA routing

### .renderignore
This file specifies which files and directories should be ignored during deployment.

## Deployment Steps

### Option 1: Using render.yaml (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. In Render dashboard, click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect `render.yaml` and use the configuration

### Option 2: Manual Configuration (Web Service - Recommended for SPA)
1. In Render dashboard, click "New" → "Web Service"
2. Connect your repository
3. Configure the following:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
   - **Environment Variables**: 
     - `NODE_ENV=production`

### Option 3: Static Site (Alternative)
If you prefer static site deployment:
1. In Render dashboard, click "New" → "Static Site"
2. Connect your repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - Note: The `_redirects` file in `public/` folder helps with routing

## Build Output

The build process creates a `build` folder containing:
- `index.html` - Main HTML file
- `assets/` - JavaScript, CSS, and other assets
- Static files from `public/` directory

## Environment Variables

If you need to set environment variables in Render:
1. Go to your service settings
2. Navigate to "Environment" section
3. Add your environment variables

Note: Firebase configuration is already in the code. If you need to change it, update `src/firebase/config.js` or use environment variables.

## Important Notes

- The build output directory is set to `build` (configured in `vite.config.js`)
- The app is a Single Page Application (SPA), so all routes should redirect to `index.html`
- **Web Service is recommended** for proper SPA routing - the `server.js` file handles all routes correctly
- The `server.js` file serves `index.html` for all routes, ensuring React Router works properly
- If using static site, the `_redirects` file in `public/` folder helps with routing
- The `_redirects` file will be copied to the build folder during build process

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs in Render dashboard

### 404 Errors on Routes
- **Solution**: Use Web Service deployment instead of Static Site
- The `server.js` file properly handles all routes by serving `index.html` for any path
- If using static site, ensure `_redirects` file exists in `public/` folder (will be copied to build)
- Verify that `server.js` is correctly serving files from the `build` directory
- Check Render logs to see if the server is starting correctly

### Assets Not Loading
- Verify that `public` folder files are copied to build
- Check asset paths in the built `index.html`

