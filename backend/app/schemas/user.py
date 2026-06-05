from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class WorkExperienceBase(BaseModel):
    company: str
    position: str
    start_date: date
    end_date: Optional[date] = None
    description: str = ""
    achievements: str = ""


class WorkExperienceCreate(WorkExperienceBase):
    pass


class WorkExperienceResponse(WorkExperienceBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


class EducationBase(BaseModel):
    school: str
    degree: str
    major: str
    start_date: date
    end_date: Optional[date] = None


class EducationCreate(EducationBase):
    pass


class EducationResponse(EducationBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


class SkillBase(BaseModel):
    name: str
    level: str = "中等"


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


class CertificateBase(BaseModel):
    name: str
    issuer: str = ""
    date_obtained: Optional[date] = None


class CertificateCreate(CertificateBase):
    pass


class CertificateResponse(CertificateBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


class ProjectExperienceBase(BaseModel):
    project_name: str
    role: str = ""
    start_date: date
    end_date: Optional[date] = None
    description: str = ""
    achievements: str = ""
    tech_stack: str = ""


class ProjectExperienceCreate(ProjectExperienceBase):
    pass


class ProjectExperienceResponse(ProjectExperienceBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    name: str = ""
    phone: str = ""
    email: str = ""
    title: str = ""
    summary: str = ""
    work_experiences: list[WorkExperienceCreate] = []
    educations: list[EducationCreate] = []
    skills: list[SkillCreate] = []
    certificates: list[CertificateCreate] = []
    project_experiences: list[ProjectExperienceCreate] = []


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str
    title: str
    summary: str
    created_at: datetime
    updated_at: datetime
    work_experiences: list[WorkExperienceResponse] = []
    educations: list[EducationResponse] = []
    skills: list[SkillResponse] = []
    certificates: list[CertificateResponse] = []
    project_experiences: list[ProjectExperienceResponse] = []

    model_config = {"from_attributes": True}
