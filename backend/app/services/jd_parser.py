"""JD解析服务 - 提取硬性要求、职责关键词、软性要求"""
import json
import re
from typing import Any

TECH_SKILLS = [
    "python", "java", "javascript", "typescript", "go", "rust", "c++", "c#",
    "react", "vue", "angular", "node", "spring", "django", "flask", "fastapi",
    "docker", "kubernetes", "k8s", "aws", "azure", "gcp", "阿里云", "腾讯云",
    "mysql", "postgresql", "redis", "mongodb", "elasticsearch",
    "tensorflow", "pytorch", "bert", "gpt", "llm", "spacy", "nlp",
    "git", "ci/cd", "jenkins", "linux", "sql",
]


def extract_requirements(text: str) -> list[dict]:
    """提取硬性要求：技能、年限、学历、证书"""
    requirements = []

    # 年限要求
    year_patterns = re.findall(r"(\d+)[\-~到\s]*(\d*)\s*年.*?经验", text)
    for yp in year_patterns:
        req = {"type": "experience", "value": f"{yp[0]}-{yp[1]}年" if yp[1] else f"{yp[0]}年以上"}
        if req not in requirements:
            requirements.append(req)

    # 学历要求
    edu_patterns = ["本科", "硕士", "博士", "大专"]
    for ep in edu_patterns:
        if ep in text:
            requirements.append({"type": "education", "value": ep})
            break

    # 技能关键词
    found_skills = set()
    for skill in TECH_SKILLS:
        if skill.lower() in text.lower():
            found_skills.add(skill)
    for skill in sorted(found_skills):
        requirements.append({"type": "skill", "value": skill})

    # 证书要求
    cert_patterns = re.findall(r"(持有|具备|通过)[^，。]*?(证书|证|资格)", text)
    for cp in cert_patterns:
        requirements.append({"type": "certificate", "value": cp[0] + cp[1]})

    return requirements


def extract_responsibilities(text: str) -> list[str]:
    """提取职责关键词"""
    lines = text.split("\n")
    responsibilities = []
    in_duty_section = False
    duty_keywords = ["职责", "工作内容", "岗位职责", "职位描述", "responsibilities"]

    for line in lines:
        line_stripped = line.strip()
        if any(kw in line_stripped for kw in duty_keywords):
            in_duty_section = True
            continue
        if in_duty_section and line_stripped:
            # 清理行首序号
            clean = re.sub(r"^[\d\.\-\*、\s]+", "", line_stripped)
            if clean and len(clean) > 4:
                responsibilities.append(clean)
        if in_duty_section and not line_stripped:
            in_duty_section = False

    return responsibilities[:20]


def extract_soft_skills(text: str) -> list[str]:
    """提取软性要求"""
    soft_keywords = [
        "沟通", "团队合作", "协作", "抗压", "责任心", "主动", "学习能力",
        "解决问题", "逻辑思维", "创新", "细心", "耐心", "执行力",
    ]
    found = []
    for kw in soft_keywords:
        if kw in text:
            found.append(kw)
    return found


def extract_keywords(text: str) -> list[dict]:
    """提取所有关键词及其类别"""
    words: list[dict[str, Any]] = []
    seen = set()

    for skill in TECH_SKILLS:
        if skill.lower() in text.lower() and skill not in seen:
            words.append({"word": skill, "category": "skill", "importance": "high"})
            seen.add(skill)

    soft = extract_soft_skills(text)
    for s in soft:
        if s not in seen:
            words.append({"word": s, "category": "soft_skill", "importance": "medium"})
            seen.add(s)

    return words


def parse_jd(text: str) -> dict:
    """完整解析JD文本"""
    return {
        "requirements": extract_requirements(text),
        "responsibilities": extract_responsibilities(text),
        "soft_skills": extract_soft_skills(text),
        "keywords": extract_keywords(text),
    }
