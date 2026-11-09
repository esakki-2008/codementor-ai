# CodeMentor AI Backend

FastAPI backend for the CodeMentor AI Next.js application.

## Requirements

- Python 3.12+
- A Neon PostgreSQL project

## Windows PowerShell setup

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `backend/.env` and replace the `DATABASE_URL` placeholder with the connection string from Neon. Keep the password private. The local `.env` file is ignored by Git.

## Run the API

With the virtual environment active and the terminal in `backend`:

```powershell
uvicorn main:app --reload --port 8000
```

Open:

- API root: http://127.0.0.1:8000/
- Health: http://127.0.0.1:8000/health
- Neon connection test: http://127.0.0.1:8000/health/db
- Interactive API docs: http://127.0.0.1:8000/docs

The database connection is created lazily when `/health/db` is requested. The app can therefore start even before a local database URL is configured.

## Security notes

- Never commit `.env`, database passwords, or Neon credentials.
- Do not execute student-submitted Python code inside this API process.
- The current database endpoint is a connectivity check only; schema and authentication will be added in later steps.
