"""用户管理 API"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import (User, Certificate, Education, ProjectExperience,
                              Skill, WorkExperience)
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    WorkExperienceCreate,
    WorkExperienceResponse,
    EducationCreate,
    EducationResponse,
    SkillCreate,
    SkillResponse,
    CertificateCreate,
    CertificateResponse,
    ProjectExperienceCreate,
    ProjectExperienceResponse,
)
from app.services.resume_parser import parse_resume_file

router = APIRouter(prefix="/api/users", tags=["用户管理"])


@router.post("", response_model=UserResponse)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    user = User(
        name=data.name,
        phone=data.phone,
        email=data.email,
        title=data.title,
        summary=data.summary,
    )
    db.add(user)
    db.flush()

    for w in data.work_experiences:
        db.add(WorkExperience(user_id=user.id, **w.model_dump()))
    for e in data.educations:
        db.add(Education(user_id=user.id, **e.model_dump()))
    for s in data.skills:
        db.add(Skill(user_id=user.id, **s.model_dump()))
    for c in data.certificates:
        db.add(Certificate(user_id=user.id, **c.model_dump()))
    for p in data.project_experiences:
        db.add(ProjectExperience(user_id=user.id, **p.model_dump()))

    db.commit()
    db.refresh(user)
    return user


@router.get("", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    db.delete(user)
    db.commit()
    return {"ok": True, "message": "用户已删除"}


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(user, key, val)
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/work-experiences", response_model=WorkExperienceResponse)
def add_work_experience(user_id: int, data: WorkExperienceCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    exp = WorkExperience(user_id=user_id, **data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.put("/work-experiences/{exp_id}", response_model=WorkExperienceResponse)
def update_work_experience(exp_id: int, data: WorkExperienceCreate, db: Session = Depends(get_db)):
    exp = db.query(WorkExperience).filter(WorkExperience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="经历不存在")
    for key, val in data.model_dump().items():
        setattr(exp, key, val)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/work-experiences/{exp_id}")
def delete_work_experience(exp_id: int, db: Session = Depends(get_db)):
    exp = db.query(WorkExperience).filter(WorkExperience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="经历不存在")
    db.delete(exp)
    db.commit()
    return {"ok": True}


# 教育经历 CRUD
@router.post("/{user_id}/educations", response_model=EducationResponse)
def add_education(user_id: int, data: EducationCreate, db: Session = Depends(get_db)):
    edu = Education(user_id=user_id, **data.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu


@router.put("/educations/{edu_id}", response_model=EducationResponse)
def update_education(edu_id: int, data: EducationCreate, db: Session = Depends(get_db)):
    edu = db.query(Education).filter(Education.id == edu_id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="教育经历不存在")
    for key, val in data.model_dump().items():
        setattr(edu, key, val)
    db.commit()
    db.refresh(edu)
    return edu


@router.delete("/educations/{edu_id}")
def delete_education(edu_id: int, db: Session = Depends(get_db)):
    edu = db.query(Education).filter(Education.id == edu_id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="教育经历不存在")
    db.delete(edu)
    db.commit()
    return {"ok": True}


# 技能 CRUD
@router.post("/{user_id}/skills", response_model=SkillResponse)
def add_skill(user_id: int, data: SkillCreate, db: Session = Depends(get_db)):
    skill = Skill(user_id=user_id, **data.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/skills/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="技能不存在")
    db.delete(skill)
    db.commit()
    return {"ok": True}


# 证书 CRUD
@router.post("/{user_id}/certificates", response_model=CertificateResponse)
def add_certificate(user_id: int, data: CertificateCreate, db: Session = Depends(get_db)):
    cert = Certificate(user_id=user_id, **data.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.delete("/certificates/{cert_id}")
def delete_certificate(cert_id: int, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="证书不存在")
    db.delete(cert)
    db.commit()
    return {"ok": True}


def _parse_date(s: str) -> date | None:
    """将 '2023.09' / '2027.06' / '2024' 等转为 date 对象"""
    if not s or s in ("至今", "至今"):
        return None
    s = s.strip().replace(".", "-").replace("/", "-").replace("年", "-").replace("月", "")
    parts = s.split("-")
    try:
        y = int(parts[0])
        m = int(parts[1]) if len(parts) > 1 and parts[1] else 1
        d = int(parts[2]) if len(parts) > 2 and parts[2] else 1
        return date(y, m, d)
    except (ValueError, IndexError):
        return None


# ── 项目经历 CRUD ──

@router.post("/{user_id}/projects", response_model=ProjectExperienceResponse)
def add_project(user_id: int, data: ProjectExperienceCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    proj = ProjectExperience(user_id=user_id, **data.model_dump())
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj


@router.put("/projects/{proj_id}", response_model=ProjectExperienceResponse)
def update_project(proj_id: int, data: ProjectExperienceCreate, db: Session = Depends(get_db)):
    proj = db.query(ProjectExperience).filter(ProjectExperience.id == proj_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="项目经历不存在")
    for key, val in data.model_dump().items():
        setattr(proj, key, val)
    db.commit()
    db.refresh(proj)
    return proj


@router.delete("/projects/{proj_id}")
def delete_project(proj_id: int, db: Session = Depends(get_db)):
    proj = db.query(ProjectExperience).filter(ProjectExperience.id == proj_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="项目经历不存在")
    db.delete(proj)
    db.commit()
    return {"ok": True}


@router.post("/{user_id}/upload-resume")
def upload_resume(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """上传原简历文件（PDF/Word），自动解析并填充用户信息"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if not file.filename:
        raise HTTPException(status_code=400, detail="文件名不能为空")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("pdf", "docx", "doc"):
        raise HTTPException(status_code=400, detail="仅支持 PDF 和 Word 文档格式")

    file_bytes = file.file.read()
    try:
        info = parse_resume_file(file.filename, file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"文件解析失败: {str(e)}")

    # 自动填充用户信息（上传简历时始终覆盖）
    if info.get("name"):
        user.name = info["name"]
    if info.get("phone"):
        user.phone = info["phone"]
    if info.get("email"):
        user.email = info["email"]
    if info.get("summary"):
        user.summary = info["summary"]

    # 添加技能（去重）
    existing_skills = {s.name.lower() for s in user.skills}
    for skill_name in info.get("skills", []):
        if skill_name.lower() not in existing_skills:
            db.add(Skill(user_id=user_id, name=skill_name, level="中等"))
            existing_skills.add(skill_name.lower())

    # 添加教育经历（去重：学校+专业相同视为重复）
    existing_edu = {(e.school, e.major) for e in user.educations}
    for edu in info.get("educations", []):
        key = (edu.get("school", ""), edu.get("major", ""))
        if key not in existing_edu and key != ("", ""):
            db.add(Education(
                user_id=user_id,
                school=edu.get("school", ""),
                degree=edu.get("degree", ""),
                major=edu.get("major", ""),
                start_date=_parse_date(edu.get("start_date", "")),
                end_date=_parse_date(edu.get("end_date", "")),
            ))
            existing_edu.add(key)

    # 添加工作经历
    existing_exp = {(e.company, e.position) for e in user.work_experiences}
    for exp in info.get("work_experiences", []):
        key = (exp.get("company", ""), exp.get("position", ""))
        if key not in existing_exp and key != ("", ""):
            db.add(WorkExperience(
                user_id=user_id,
                company=exp.get("company", ""),
                position=exp.get("position", ""),
                start_date=_parse_date(exp.get("start_date", "")),
                end_date=_parse_date(exp.get("end_date", "")),
                description=exp.get("description", ""),
                achievements=exp.get("achievements", ""),
            ))

    # 添加项目经历（去重：项目名相同视为重复）
    existing_proj = {p.project_name for p in user.project_experiences}
    for proj in info.get("projects", []):
        name = proj.get("project_name", "")
        if name and name not in existing_proj:
            db.add(ProjectExperience(
                user_id=user_id,
                project_name=name,
                role=proj.get("role", ""),
                start_date=_parse_date(proj.get("start_date", "")),
                end_date=_parse_date(proj.get("end_date", "")),
                description=proj.get("description", ""),
                achievements=proj.get("achievements", ""),
                tech_stack="",
            ))
            existing_proj.add(name)

    # 添加证书（去重）
    existing_cert = {c.name for c in user.certificates}
    for cert in info.get("certificates", []):
        name = cert.get("name", "")
        if name and name not in existing_cert:
            db.add(Certificate(
                user_id=user_id,
                name=name,
                issuer=cert.get("issuer", ""),
            ))
            existing_cert.add(name)

    db.commit()
    db.refresh(user)

    return {
        "ok": True,
        "extracted": {
            "name": info.get("name") or "",
            "phone": info.get("phone") or "",
            "email": info.get("email") or "",
            "skills": info.get("skills", []),
            "summary": info.get("summary") or "",
            "educations": info.get("educations", []),
            "work_experiences": info.get("work_experiences", []),
            "projects": info.get("projects", []),
            "certificates": info.get("certificates", []),
        },
    }
