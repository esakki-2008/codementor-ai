from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Course, Lesson, LessonProgress, User

router = APIRouter(prefix="/api/v1/learning", tags=["Learning"])


class LessonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    sequence_number: int
    estimated_minutes: int


class CourseResponse(BaseModel):
    id: int
    title: str
    programming_language: str
    description: str
    level: str
    lessons: list[LessonSummary]


class ProgressItem(BaseModel):
    lesson_id: int
    status: str
    score: float
    completed_at: datetime | None


class ProgressResponse(BaseModel):
    total_lessons: int
    completed_lessons: int
    completion_percentage: float
    items: list[ProgressItem]


class CompleteLessonRequest(BaseModel):
    score: float = 100


@router.get("/courses/python", response_model=CourseResponse)
def get_python_course(
    db: Annotated[Session, Depends(get_db)],
    _user: Annotated[User, Depends(get_current_user)],
):
    course = db.scalar(
        select(Course).where(
            Course.programming_language == "python",
            Course.is_published.is_(True),
        ).order_by(Course.id)
    )
    if course is None:
        raise HTTPException(status_code=404, detail="Python course has not been seeded yet.")
    lessons = db.scalars(
        select(Lesson).where(Lesson.course_id == course.id).order_by(Lesson.sequence_number)
    ).all()
    return {
        "id": course.id,
        "title": course.title,
        "programming_language": course.programming_language,
        "description": course.description,
        "level": course.level,
        "lessons": lessons,
    }


@router.get("/progress", response_model=ProgressResponse)
def get_progress(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    course = db.scalar(
        select(Course).where(
            Course.programming_language == "python",
            Course.is_published.is_(True),
        ).order_by(Course.id)
    )
    if course is None:
        return {"total_lessons": 0, "completed_lessons": 0, "completion_percentage": 0, "items": []}
    lesson_ids = db.scalars(select(Lesson.id).where(Lesson.course_id == course.id)).all()
    records = db.scalars(
        select(LessonProgress).where(
            LessonProgress.user_id == user.id,
            LessonProgress.lesson_id.in_(lesson_ids),
        )
    ).all() if lesson_ids else []
    completed = sum(1 for record in records if record.status == "completed")
    total = len(lesson_ids)
    return {
        "total_lessons": total,
        "completed_lessons": completed,
        "completion_percentage": round(completed / total * 100, 1) if total else 0,
        "items": [
            {
                "lesson_id": record.lesson_id,
                "status": record.status,
                "score": record.score,
                "completed_at": record.completed_at,
            }
            for record in records
        ],
    }


@router.post("/lessons/{lesson_id}/complete", response_model=ProgressItem)
def complete_lesson(
    lesson_id: int,
    payload: CompleteLessonRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    lesson = db.get(Lesson, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    progress = db.scalar(
        select(LessonProgress).where(
            LessonProgress.user_id == user.id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    now = datetime.now(timezone.utc)
    score = max(0, min(payload.score, 100))
    if progress is None:
        progress = LessonProgress(
            user_id=user.id,
            lesson_id=lesson_id,
            status="completed",
            score=score,
            completed_at=now,
        )
        db.add(progress)
    else:
        progress.status = "completed"
        progress.score = max(progress.score, score)
        progress.completed_at = now
    db.commit()
    db.refresh(progress)
    return progress
