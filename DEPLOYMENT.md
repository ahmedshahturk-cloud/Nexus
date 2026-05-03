# Deployment Guide — Nexus

Follow these steps to deploy Nexus to production.

## 1. Backend Deployment (Railway)
1.  Push the code to GitHub.
2.  Connect your repository to [Railway](https://railway.app/).
3.  Set the following Environment Variables:
    - `DATABASE_URL`: Your PostgreSQL connection string.
    - `SECRET_KEY`: A long, random string.
    - `ALGORITHM`: `HS256`
    - `ACCESS_TOKEN_EXPIRE_MINUTES`: `60`
4.  Railway will automatically detect the `Procfile` and start the server.

## 2. Frontend Deployment (Vercel)
1.  Connect your repository to [Vercel](https://vercel.com/).
2.  Set the Build Command: `npm run build`
3.  Set the Output Directory: `dist`
4.  Set the Environment Variable:
    - `VITE_API_URL`: The URL of your deployed Railway backend (e.g., `https://nexus-api.up.railway.app`).
5.  Vercel will build and deploy the frontend.

## 3. Database Migration
Once the backend is live on Railway:
1.  Run the migrations locally against the production DB (or use Railway's terminal):
    ```bash
    alembic upgrade head
    ```
    *(Ensure your local .env points to the Railway DB temporarily or use Railway's migration tool)*
