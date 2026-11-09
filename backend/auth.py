import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
password_hasher = PasswordHash.recommended()
DUMMY_HASH = password_hasher.hash("not-a-real-user-password")


def _jwt_settings() -> tuple[str, str, int]:
    secret = os.getenv("JWT_SECRET_KEY")
    if not secret or len(secret) < 32:
        raise RuntimeError("Set a random JWT_SECRET_KEY of at least 32 characters in backend/.env.")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    expires = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    return secret, algorithm, expires


def create_access_token(user_id: int) -> str:
    secret, algorithm, expires = _jwt_settings()
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user_id), "iat": now, "exp": now + timedelta(minutes=expires)}
    return jwt.encode(payload, secret, algorithm=algorithm)


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        secret, algorithm, _ = _jwt_settings()
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        subject = payload.get("sub")
        if not subject:
            raise credentials_error
        user_id = int(subject)
    except (jwt.InvalidTokenError, ValueError, RuntimeError) as exc:
        raise credentials_error from exc

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise credentials_error
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Annotated[Session, Depends(get_db)]) -> User:
    email = payload.email.strip().lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        password_hash=password_hasher.hash(payload.password),
        experience_level=payload.experience_level,
        learning_goal=payload.learning_goal,
        preferred_language="python",
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists.") from exc
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    email = payload.email.strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    stored_hash = user.password_hash if user else DUMMY_HASH
    password_valid = password_hasher.verify(payload.password, stored_hash)

    if not user or not password_valid or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserResponse)
def read_me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user
