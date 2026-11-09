import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.exc import SQLAlchemyError

# Load backend/.env when running locally. Environment variables supplied by
# a deployment platform take precedence over this local file.
load_dotenv(Path(__file__).with_name(".env"), override=False)

app = FastAPI(
    title="CodeMentor AI API",
    description="Backend API for the CodeMentor AI learning platform.",
    version="0.1.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """Create the Neon connection pool only when a DB route is called."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is not set. Add it to backend/.env for local development."
        )

    url = make_url(database_url)

    # Use Psycopg 3 explicitly. Neon connection strings normally include
    # sslmode=require; preserve that query parameter.
    if url.drivername in ("postgres", "postgresql"):
        url = url.set(drivername="postgresql+psycopg")

    return create_engine(
        url,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"connect_timeout": 10},
    )


@app.get("/", tags=["General"])
def home() -> dict[str, str]:
    return {
        "name": "CodeMentor AI API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.get("/health/db", tags=["Health"])
def database_health() -> dict[str, str]:
    try:
        with get_engine().connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "database": "Neon PostgreSQL",
            "message": "Database connection successful.",
        }
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except SQLAlchemyError as exc:
        # Avoid returning connection details or credentials to the client.
        raise HTTPException(
            status_code=503,
            detail="Could not connect to Neon. Check DATABASE_URL and Neon compute status.",
        ) from exc
