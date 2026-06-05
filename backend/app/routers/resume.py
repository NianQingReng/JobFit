"""简历生成与管理 API"""
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.jd import JD
from app.models.resume import ResumeExperience, ResumeVersion
from app.models.user import User
from app.schemas.resume import (
    ResumeCreate,
    ResumeResponse,
    ResumeUpdate,
    RewriteRequest,
    RewriteResponse,
)
from app.services.resume_generator import generate_resume_content, rewrite_experience

router = APIRouter(prefix="/api/resumes", tags=["简历管理"])


@router.post("", response_model=ResumeResponse)
def create_resume(data: ResumeCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    resume = ResumeVersion(
        user_id=data.user_id,
        jd_id=data.jd_id,
        title=data.title,
        content=data.content,
    )
    db.add(resume)
    db.flush()

    for exp in data.experiences:
        db.add(ResumeExperience(resume_id=resume.id, **exp.model_dump()))

    db.commit()
    db.refresh(resume)
    return resume


@router.get("", response_model=list[ResumeResponse])
def list_resumes(user_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(ResumeVersion)
    if user_id:
        query = query.filter(ResumeVersion.user_id == user_id)
    return query.order_by(ResumeVersion.updated_at.desc()).all()


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(ResumeVersion).filter(ResumeVersion.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="简历不存在")
    return resume


@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(resume_id: int, data: ResumeUpdate, db: Session = Depends(get_db)):
    resume = db.query(ResumeVersion).filter(ResumeVersion.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="简历不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(resume, key, val)
    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(ResumeVersion).filter(ResumeVersion.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="简历不存在")
    db.delete(resume)
    db.commit()
    return {"ok": True}


@router.post("/generate")
def generate_resume(user_id: int, jd_id: int, db: Session = Depends(get_db)):
    """基于用户信息和JD自动生成简历"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    jd = db.query(JD).filter(JD.id == jd_id).first() if jd_id else None

    user_data = {
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "title": user.title,
        "summary": user.summary,
        "work_experiences": [
            {"company": w.company, "position": w.position, "start_date": str(w.start_date), "end_date": str(w.end_date) if w.end_date else "", "description": w.description, "achievements": w.achievements}
            for w in user.work_experiences
        ],
        "educations": [
            {"school": e.school, "degree": e.degree, "major": e.major, "start_date": str(e.start_date), "end_date": str(e.end_date) if e.end_date else ""}
            for e in user.educations
        ],
        "project_experiences": [
            {"project_name": p.project_name, "role": p.role, "start_date": str(p.start_date), "end_date": str(p.end_date) if p.end_date else "", "description": p.description, "achievements": p.achievements, "tech_stack": p.tech_stack}
            for p in user.project_experiences
        ],
        "skills": [{"name": s.name, "level": s.level} for s in user.skills],
        "certificates": [{"name": c.name, "issuer": c.issuer} for c in user.certificates],
    }

    content = generate_resume_content(user_data)
    title = f"针对{jd.title}的定制简历" if jd and jd.title else "我的简历"

    resume = ResumeVersion(
        user_id=user_id,
        jd_id=jd_id,
        title=title,
        content=json.dumps(content, ensure_ascii=False),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.post("/rewrite", response_model=RewriteResponse)
def rewrite_experience_endpoint(data: RewriteRequest):
    """重写工作经历"""
    versions = rewrite_experience(data.original_text, data.jd_keywords, data.count)
    return RewriteResponse(versions=versions)
