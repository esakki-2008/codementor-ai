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
- Database schema check: http://127.0.0.1:8000/health/schema
- Interactive API docs: http://127.0.0.1:8000/docs

## Database tables

On local MVP startup, `AUTO_CREATE_TABLES=true` creates these tables if they do not exist:

- `users`
- `courses`
- `lessons`
- `exercises`
- `submissions`
- `lesson_progress`
- `tutor_sessions`
- `tutor_messages`

This uses SQLAlchemy `create_all` for initial development. Before production, switch to versioned Alembic migrations and set `AUTO_CREATE_TABLES=false`.

## Security notes

- Never commit `.env`, database passwords, or Neon credentials.
- User password values are stored as password hashes, never plaintext; authentication routes will be implemented separately.
- Do not execute student-submitted Python code inside this API process.
