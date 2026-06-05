from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ResumeExperienceData(BaseModel):
    type: str
    original_text: str
    rewritten_text: str


class ResumeCreate(BaseModel):
    user_id: int
    jd_id: Optional[int] = None
    title: str = "未命名简历"
    content: str = "{}"
    experiences: list[ResumeExperienceData] = []


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    jd_id: Optional[int] = None
    title: str
    content: str
    style_template: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RewriteRequest(BaseModel):
    original_text: str
    jd_keywords: list[str]
    count: int = 3


class RewriteResponse(BaseModel):
    versions: list[str]
