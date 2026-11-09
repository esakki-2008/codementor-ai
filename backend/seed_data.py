"""Create the starter Python course and five lessons in the configured database."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import Base, get_engine
from models import Course, Lesson
import models  # noqa: F401

engine = get_engine()
Base.metadata.create_all(bind=engine)

lesson_data = [
    ("Introduction to Python", "Learn what Python is and how programs give instructions to a computer.", 1, 15),
    ("Variables & data types", "Store information using variables, strings, integers and other basic data types.", 2, 20),
    ("Input & output", "Read information with input() and display results with print().", 3, 15),
    ("Operators", "Use arithmetic and comparison operators to work with values.", 4, 20),
    ("If / else statements", "Make decisions in your programs using conditions and indentation.", 5, 25),
]

with Session(engine) as db:
    course = db.scalar(
        select(Course).where(
            Course.programming_language == "python",
            Course.title == "Python for Beginners",
        )
    )
    if course is None:
        course = Course(
            title="Python for Beginners",
            programming_language="python",
            description="A practical, beginner-friendly introduction to Python programming.",
            level="beginner",
            is_published=True,
        )
        db.add(course)
        db.flush()
    else:
        course.is_published = True

    for title, description, sequence, minutes in lesson_data:
        lesson = db.scalar(
            select(Lesson).where(
                Lesson.course_id == course.id,
                Lesson.sequence_number == sequence,
            )
        )
        if lesson is None:
            db.add(Lesson(
                course_id=course.id,
                title=title,
                content={"explanation": description},
                sequence_number=sequence,
                estimated_minutes=minutes,
            ))
        else:
            lesson.title = title
            lesson.content = {"explanation": description}
            lesson.estimated_minutes = minutes
    db.commit()

print("Starter Python course and 5 lessons are ready.")
