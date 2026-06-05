from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    jd_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("jds.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), default="未命名简历")
    content: Mapped[str] = mapped_column(Text, comment="JSON: 完整的简历内容")
    style_template: Mapped[str] = mapped_column(String(100), default="default")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class ResumeExperience(Base):
    __tablename__ = "resume_experiences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    resume_id: Mapped[int] = mapped_column(Integer, ForeignKey("resume_versions.id"))
    original_id: Mapped[int] = mapped_column(Integer, comment="关联的原始经历ID")
    type: Mapped[str] = mapped_column(String(50), comment="work / education")
    original_text: Mapped[str] = mapped_column(Text)
    rewritten_text: Mapped[str] = mapped_column(Text)
    version: Mapped[str] = mapped_column(String(20), default="v1")
