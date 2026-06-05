"""JD 解析与匹配 API"""
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.jd import JD, JDKeyword, JDMatchResult
from app.models.user import User
from app.schemas.jd import JDCreate, JDResponse, MatchRequest, MatchResponse
from app.services.jd_parser import parse_jd
from app.services.matcher import calculate_match

router = APIRouter(prefix="/api/jds", tags=["JD管理"])


@router.post("", response_model=JDResponse)
def create_jd(data: JDCreate, db: Session = Depends(get_db)):
    """创建并解析JD"""
    parsed = parse_jd(data.raw_text)

    jd = JD(
        title=data.title,
        company=data.company,
        raw_text=data.raw_text,
        parsed_requirements=json.dumps(parsed["requirements"], ensure_ascii=False),
        parsed_responsibilities=json.dumps(parsed["responsibilities"], ensure_ascii=False),
        parsed_soft_skills=json.dumps(parsed["soft_skills"], ensure_ascii=False),
    )
    db.add(jd)
    db.flush()

    for kw in parsed["keywords"]:
        db.add(JDKeyword(jd_id=jd.id, **kw))

    db.commit()
    db.refresh(jd)
    return jd


@router.get("", response_model=list[JDResponse])
def list_jds(db: Session = Depends(get_db)):
    return db.query(JD).order_by(JD.created_at.desc()).all()


@router.get("/{jd_id}", response_model=JDResponse)
def get_jd(jd_id: int, db: Session = Depends(get_db)):
    jd = db.query(JD).filter(JD.id == jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="JD不存在")
    return jd


@router.delete("/{jd_id}")
def delete_jd(jd_id: int, db: Session = Depends(get_db)):
    jd = db.query(JD).filter(JD.id == jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="JD不存在")
    db.delete(jd)
    db.commit()
    return {"ok": True}


@router.post("/match", response_model=MatchResponse)
def match_jd(data: MatchRequest, db: Session = Depends(get_db)):
    """分析用户与JD的匹配度"""
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    jd = db.query(JD).filter(JD.id == data.jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="JD不存在")

    result = calculate_match(user, jd)

    match_record = JDMatchResult(
        jd_id=data.jd_id,
        user_id=data.user_id,
        score=result["score"],
        matched_items=json.dumps(result["matched_items"], ensure_ascii=False),
        missing_items=json.dumps(result["missing_items"], ensure_ascii=False),
        optimizable_items=json.dumps(result["optimizable_items"], ensure_ascii=False),
        suggestions=result["suggestions"],
    )
    db.add(match_record)
    db.commit()
    db.refresh(match_record)

    return MatchResponse(
        jd_id=match_record.jd_id,
        user_id=match_record.user_id,
        score=match_record.score,
        matched_items=json.loads(match_record.matched_items),
        missing_items=json.loads(match_record.missing_items),
        optimizable_items=json.loads(match_record.optimizable_items),
        suggestions=match_record.suggestions,
        created_at=match_record.created_at,
    )
