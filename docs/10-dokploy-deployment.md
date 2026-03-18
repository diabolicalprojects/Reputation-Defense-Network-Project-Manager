# 10-dokploy-deployment.md
## Dokploy MERN Deployment Guide

1. **Database:** - In Dokploy, go to Databases -> Create MongoDB.
   - Copy the internal connection string (e.g., `mongodb://user:pass@mongodb-service:27017/rdn-manager`).
2. **Backend (Node/Express):**
   - Create an Application in Dokploy linked to your Git repository (backend folder).
   - Set Environment Variables: `MONGO_URI`, `JWT_SECRET`, `PORT=3000`.
   - Set build/start commands (e.g., `npm run build`, `npm start`).
3. **Frontend (React/Vite):**
   - Create a second Application in Dokploy for the frontend.
   - Set Environment Variables: `VITE_API_URL` pointing to your deployed backend URL.
   - Build command: `npm run build`. 
   - Publish directory: `dist`.