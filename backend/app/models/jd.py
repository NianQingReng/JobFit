from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class JD(Base):
    __tablename__ = "jds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), default="")
    company: Mapped[str] = mapped_column(String(200), default="")
    raw_text: Mapped[str] = mapped_column(Text)
    parsed_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="JSON: 解析后的硬性要求")
    parsed_responsibilities: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="JSON: 职责关键词")
    parsed_soft_skills: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="JSON: 软性要求")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    keywords: Mapped[list["JDKeyword"]] = relationship(back_populates="jd", cascade="all, delete-orphan")
    match_results: Mapped[list["JDMatchResult"]] = relationship(back_populates="jd", cascade="all, delete-orphan")


class JDKeyword(Base):
    __tablename__ = "jd_keywords"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    jd_id: Mapped[int] = mapped_column(Integer, ForeignKey("jds.id"))
    word: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(50), comment="skill / requirement / responsibility")
    importance: Mapped[str] = mapped_column(String(20), default="medium")

    jd: Mapped["JD"] = relationship(back_populates="keywords")


class JDMatchResult(Base):
    __tablename__ = "jd_match_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    jd_id: Mapped[int] = mapped_column(Integer, ForeignKey("jds.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    score: Mapped[float] = mapped_column(Float)
    matched_items: Mapped[str] = mapped_column(Text, comment="JSON")
    missing_items: Mapped[str] = mapped_column(Text, comment="JSON")
    optimizable_items: Mapped[str] = mapped_column(Text, comment="JSON")
    suggestions: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    jd: Mapped["JD"] = relationship(back_populates="match_results")
