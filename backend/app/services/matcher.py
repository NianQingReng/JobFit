"""匹配度分析服务"""
import json
import re
from typing import Any

from app.models.user import User
from app.models.jd import JD


def calculate_match(user: User, jd: JD) -> dict[str, Any]:
    """计算用户与JD的匹配度"""
    jd_keywords = {kw.word.lower() for kw in jd.keywords}
    user_skills = {s.name.lower() for s in user.skills}
    user_title = user.title.lower() if user.title else ""
    user_summary = user_summary_text(user)

    matched: list[dict] = []
    missing: list[dict] = []
    optimizable: list[dict] = []

    # 匹配技能关键词
    for word in jd_keywords:
        # 检查是否在用户技能中
        if word in user_skills:
            matched.append({"type": "skill", "item": word, "detail": "技能匹配"})
        elif word in user_summary:
            matched.append({"type": "skill", "item": word, "detail": "经历中提及"})
            optimizable.append({"type": "skill", "item": word, "detail": "建议添加到技能列表"})
        else:
            missing.append({"type": "skill", "item": word, "detail": "缺失技能"})

    # 学历匹配
    jd_parsed = jd.parsed_requirements
    if jd_parsed:
        try:
            reqs = json.loads(jd_parsed) if isinstance(jd_parsed, str) else jd_parsed
            for req in reqs:
                matched.append({"type": "requirement", "item": req.get("value", ""), "detail": "JD要求项"})
        except json.JSONDecodeError:
            pass

    # 计算匹配分数
    total = len(matched) + len(missing) + len(optimizable)
    score = round(len(matched) / max(total, 1) * 100, 1)

    suggestions = generate_suggestions(matched, missing, optimizable)

    return {
        "score": score,
        "matched_items": matched,
        "missing_items": missing,
        "optimizable_items": optimizable,
        "suggestions": suggestions,
    }


def user_summary_text(user: User) -> str:
    """收集用户文本信息用于关键词匹配"""
    texts = [user.summary]
    for exp in user.work_experiences:
        texts.append(exp.description)
        texts.append(exp.achievements)
    return " ".join(texts).lower()


def generate_suggestions(matched: list, missing: list, optimizable: list) -> str:
    """生成建议文本"""
    suggestions = []
    if missing:
        skills = [m["item"] for m in missing if m["type"] == "skill"]
        if skills:
            suggestions.append(f"建议补充以下技能：{', '.join(skills[:5])}")
        reqs = [m["item"] for m in missing if m["type"] != "skill"]
        if reqs:
            suggestions.append(f"注意JD要求：{', '.join(reqs[:3])}")
    if optimizable:
        items = [o["item"] for o in optimizable[:3]]
        suggestions.append(f"建议在经历描述中突出：{', '.join(items)}")
    if matched:
        suggestions.append(f"匹配项共{len(matched)}项，建议在简历中重点展示匹配关键词。")
    return "\n".join(suggestions) if suggestions else "未发现明显短板，可进一步优化经历表述以提升匹配度。"
