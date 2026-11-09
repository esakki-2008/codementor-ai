import os
from contextlib import asynccontextmanager
from pathlib import Path
from collections.abc import AsyncIterator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from database import Base, get_engine

# Import models so SQLAlchemy registers every table in Base.metadata.
import models  # noqa: F401

load_dotenv(Path(__file__).with_name(".env"), override=False)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Convenient for the early MVP. Use Alembic migrations before production.
    if os.getenv("AUTO_CREATE_TABLES", "true").lower() == "true":
        Base.metadata.create_all(bind=get_engine())
    yield


app = FastAPI(
    title="CodeMentor AI API",
    description="Backend API for the CodeMentor AI learning platform.",
    version="0.2.0",
    lifespan=lifespan,
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
        raise HTTPException(
            status_code=503,
            detail="Could not connect to Neon. Check DATABASE_URL and Neon compute status.",
        ) from exc


@app.get("/health/schema", tags=["Health"])
def schema_health() -> dict[str, object]:
    expected_tables = sorted(Base.metadata.tables.keys())
    try:
        with get_engine().connect() as connection:
            rows = connection.execute(
                text(
                    "SELECT table_name FROM information_schema.tables "
                    "WHERE table_schema = current_schema()"
                )
            )
            existing_tables = sorted(row[0] for row in rows)
        missing_tables = sorted(set(expected_tables) - set(existing_tables))
        return {
            "status": "ready" if not missing_tables else "incomplete",
            "expected_tables": expected_tables,
            "existing_tables": existing_tables,
            "missing_tables": missing_tables,
        }
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=503,
            detail="Could not inspect database tables.",
        ) from exc
