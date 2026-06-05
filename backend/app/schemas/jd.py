from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class JDCreate(BaseModel):
    title: str = ""
    company: str = ""
    raw_text: str


class JDResponse(BaseModel):
    id: int
    title: str
    company: str
    raw_text: str
    parsed_requirements: Optional[str] = None
    parsed_responsibilities: Optional[str] = None
    parsed_soft_skills: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class JDParseResult(BaseModel):
    requirements: list[dict] = []
    responsibilities: list[str] = []
    soft_skills: list[str] = []
    keywords: list[dict] = []


class MatchRequest(BaseModel):
    user_id: int
    jd_id: int


class MatchResponse(BaseModel):
    jd_id: int
    user_id: int
    score: float
    matched_items: list[dict]
    missing_items: list[dict]
    optimizable_items: list[dict]
    suggestions: str
    created_at: datetime

    model_config = {"from_attributes": True}
