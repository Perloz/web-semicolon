# Deploy Semicolon Academy

This project is configured as one Docker-based Render web service: Flask serves both the API and the built React app, so the dashboard and API share one HTTPS origin.

## Before publishing

- The included `backend/users.db` is the app's seeded SQLite database. It contains existing user and social-content records. Keep the source repository **private** and only deploy it if you are authorized to publish that data. Do not upload this project to a public GitHub repository.
- The Render blueprint uses a persistent disk so user data survives deploys. Persistent disks and the selected Starter instance are paid Render resources; review the current price in Render before approving creation.
- Render generates `JWT_SECRET` for the service. Keep it private.

## Deploy

1. Create a **private** GitHub repository and push this project folder's contents to its root (including `Dockerfile` and `render.yaml`).
2. In Render, choose **New → Blueprint**, connect that private repository, and review the proposed service and persistent-disk costs.
3. Apply the blueprint only if you approve the cost. Render builds the React app, installs the Python requirements, and starts Gunicorn.
4. When the deployment is live, open the `onrender.com` URL shown on the Render service page. That is the dashboard URL; no separate frontend URL or API URL is needed.

## Local run

- Backend: `cd backend && pip install -r requirements.txt && python app.py`
- Frontend (separate terminal): `cd frontend && npm ci && npm run dev`

For production, use the Docker/Render configuration above rather than the Vite development server.
