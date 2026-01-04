# Render Deployment Guide

This guide explains how to deploy the Habit Dashboard to Render.

## Configuration Files

### render.yaml
This file contains the Render service configuration. The app is configured as a web service that:
- Builds the project using `npm install && npm run build`
- Serves the built files from the `build` directory
- Uses Vite preview server for serving the static files

### .renderignore
This file specifies which files and directories should be ignored during deployment.

## Deployment Steps

### Option 1: Using render.yaml (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. In Render dashboard, click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect `render.yaml` and use the configuration

### Option 2: Manual Configuration
1. In Render dashboard, click "New" → "Static Site" (or "Web Service")
2. Connect your repository
3. Configure the following:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Start Command** (if using Web Service): `npm run preview -- --host --port $PORT`

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
- Render's static site service automatically handles SPA routing
- If using web service, ensure the preview server is configured correctly

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs in Render dashboard

### 404 Errors on Routes
- Ensure SPA routing is configured (should be automatic with static sites)
- Check that `index.html` is in the build folder

### Assets Not Loading
- Verify that `public` folder files are copied to build
- Check asset paths in the built `index.html`

