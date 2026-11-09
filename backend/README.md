# CodeMentor AI Backend

FastAPI backend for the CodeMentor AI Next.js application.

## Requirements

- Python 3.12+
- Neon PostgreSQL

## Windows PowerShell setup

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Put the generated random value in `JWT_SECRET_KEY` in `backend/.env`, and set `DATABASE_URL` to your Neon connection string. Never commit or share `.env`.

## Run

```powershell
uvicorn main:app --reload --port 8000
```

- API docs: http://127.0.0.1:8000/docs
- Neon test: http://127.0.0.1:8000/health/db
- Schema check: http://127.0.0.1:8000/health/schema

## Authentication endpoints

- `POST /api/v1/auth/register` — create a student account.
- `POST /api/v1/auth/login` — exchange email/password for a JWT access token.
- `GET /api/v1/auth/me` — return the current student; requires `Authorization: Bearer <token>`.

Passwords are hashed using Argon2. Tokens expire after the configured number of minutes. Use HTTPS and a strong unique JWT secret in deployment. For a production launch, add email verification, password reset, rate limiting, monitoring, and versioned Alembic migrations.

## Database tables

The initial schema includes users, courses, lessons, exercises, submissions, lesson_progress, tutor_sessions and tutor_messages. `AUTO_CREATE_TABLES=true` creates missing tables for local MVP development. Switch to Alembic migrations before production.
