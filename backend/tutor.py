from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import TutorMessage, TutorSession, User

router = APIRouter(prefix="/api/v1/tutor", tags=["AI Tutor"])


class TutorMessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    code: str = Field(default="", max_length=12000)
    session_id: int | None = None


class TutorMessageResponse(BaseModel):
    session_id: int
    reply: str
    mode: str = "guided_rules"


def build_guidance(message: str, code: str) -> str:
    question = message.lower()
    source = code.lower()

    if not message.strip() and not code.strip():
        return "Tell me what you are trying to understand, or paste your Python code. We will work through it one step at a time."
    if "syntaxerror" in question or "syntaxerror" in source or "invalid syntax" in question:
        return "A SyntaxError means Python cannot understand how a line is written. Check the reported line and the line before it. Look for a missing colon, an unclosed quote, or a missing closing bracket.\n\nHint: match every opening bracket with its closing bracket."
    if "nameerror" in question or "nameerror" in source or "not defined" in question:
        return "A NameError usually means Python found a name it does not know. Check spelling and capitalization, and make sure you assign a variable before using it.\n\nHint: Python treats score, Score, and SCORE as different names."
    if "indentationerror" in question or "indentationerror" in source or "unexpected indent" in question:
        return "An IndentationError means the spaces at the start of a line do not match the block structure. Use four spaces for each indentation level, and keep lines inside the same if, loop, or function aligned."
    if "typeerror" in question or "typeerror" in source:
        return "A TypeError often means an operation received a value of an unexpected type. For example, Python cannot directly add a number and a string. Hint: inspect the values and consider int(), float(), or str() where appropriate."
    if "loop" in question or "for " in source or "while " in source:
        return "A loop repeats a block of code. For a for loop, ask what sequence is being visited. For a while loop, ask what condition keeps it running and what changes so it can eventually become false.\n\nHint: trace the loop variable for the first three iterations."
    if "if" in question or "else" in question or "if " in source:
        return "An if/else statement makes a decision. Python checks the condition after if; if it is True, the indented block runs. Otherwise, the else block runs.\n\nHint: write down whether the condition is True or False for your values."
    if "function" in question or "def " in source:
        return "A function is a reusable block of code. def defines it, parameters receive input, and return sends a result back to the code that called it.\n\nHint: find the function name, its parameters, and the line that returns a value."
    if "variable" in question or "variable" in source or " = " in source:
        return "A variable is a name that refers to a value. In age = 18, Python stores 18 under the name age. A single equals sign assigns a value; two equals signs compare values.\n\nHint: predict each variable value immediately before print()."
    if "print" in question or "output" in question:
        return "print() displays values in the output area. You can print text in quotes, variables without quotes, or several values separated by commas.\n\nHint: predict the exact output before running your code, including spaces and line breaks."
    return "Let us solve this without jumping straight to the answer. First, describe what you expect the program to do. Then identify the line where the result differs from your expectation.\n\nTry this: read the code top to bottom, write down each variable value, and check conditions and indentation. Share the exact error message for a more focused hint."


@router.post('/message', response_model=TutorMessageResponse)
def send_tutor_message(
    payload: TutorMessageRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    session = None
    if payload.session_id is not None:
        session = db.scalar(select(TutorSession).where(TutorSession.id == payload.session_id, TutorSession.user_id == user.id))
        if session is None:
            raise HTTPException(status_code=404, detail="Tutor session not found.")
    if session is None:
        session = TutorSession(user_id=user.id)
        db.add(session)
        db.flush()
    reply = build_guidance(payload.message, payload.code)
    db.add(TutorMessage(session_id=session.id, role="user", content=payload.message.strip()))
    if payload.code.strip():
        db.add(TutorMessage(session_id=session.id, role="user", content="Code submitted:\n" + payload.code))
    db.add(TutorMessage(session_id=session.id, role="assistant", content=reply))
    db.commit()
    return {"session_id": session.id, "reply": reply, "mode": "guided_rules"}
