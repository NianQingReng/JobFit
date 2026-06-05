"""简历生成服务 - 经历重写、简历生成"""
import json
import random
from typing import Any

STAR_TEMPLATES = [
    "通过{action}，实现了{result}，提升了{metric}",
    "负责{task}，采用{method}，达成了{outcome}",
    "主导{project}，协调{resource}，最终{achievement}",
    "针对{problem}，提出{solution}，将{metric}提升了{percent}%",
]


def rewrite_experience(original: str, jd_keywords: list[str], count: int = 3) -> list[str]:
    """基于JD关键词生成多种重写版本（STAR格式）"""
    results = []
    lines = [l.strip() for l in original.split("\n") if l.strip()]

    for i in range(count):
        keywords_to_use = random.sample(jd_keywords, min(3, len(jd_keywords)))
        rewritten = _apply_star_template(lines, keywords_to_use, i)
        results.append(rewritten)

    return results


def _apply_star_template(lines: list[str], keywords: list[str], seed: int) -> str:
    """应用STAR模板重写经历"""
    random.seed(seed)
    template = random.choice(STAR_TEMPLATES)
    result_lines = []

    for line in lines[:2]:
        action = line[:20] if len(line) > 20 else line
        kw_str = "、".join(keywords)
        result_lines.append(template.format(
            action=action,
            result=action,
            metric="工作效率",
            task=action,
            method=kw_str,
            outcome=action,
            project=action,
            resource=kw_str,
            achievement=action,
            problem=action,
            solution=kw_str,
            percent=str(random.randint(20, 80)),
        ))

    # 加入关键词
    for kw in keywords:
        if kw not in " ".join(result_lines).lower():
            result_lines.append(f"熟练运用{kw}完成相关工作")

    return "\n".join(result_lines)


def generate_resume_content(
    user_data: dict[str, Any],
    match_result: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """生成完整的简历内容结构"""
    resume = {
        "personal": {
            "name": user_data.get("name", ""),
            "phone": user_data.get("phone", ""),
            "email": user_data.get("email", ""),
            "title": user_data.get("title", ""),
        },
        "summary": user_data.get("summary", ""),
        "education": [],
        "work_experience": [],
        "projects": [],
        "skills": [],
        "certificates": [],
    }

    for edu in user_data.get("educations", []):
        resume["education"].append({
            "school": edu["school"],
            "degree": edu["degree"],
            "major": edu["major"],
            "start_date": str(edu.get("start_date", "")),
            "end_date": str(edu.get("end_date", "")),
        })

    for exp in user_data.get("work_experiences", []):
        resume["work_experience"].append({
            "company": exp["company"],
            "position": exp["position"],
            "start_date": str(exp.get("start_date", "")),
            "end_date": str(exp.get("end_date", "")),
            "description": exp.get("description", ""),
            "achievements": exp.get("achievements", ""),
        })

    for proj in user_data.get("project_experiences", []):
        resume["projects"].append({
            "project_name": proj["project_name"],
            "role": proj.get("role", ""),
            "start_date": str(proj.get("start_date", "")),
            "end_date": str(proj.get("end_date", "")),
            "description": proj.get("description", ""),
            "achievements": proj.get("achievements", ""),
            "tech_stack": proj.get("tech_stack", ""),
        })

    for skill in user_data.get("skills", []):
        resume["skills"].append({"name": skill["name"], "level": skill.get("level", "中等")})

    for cert in user_data.get("certificates", []):
        resume["certificates"].append({"name": cert["name"], "issuer": cert.get("issuer", "")})

    return resume
