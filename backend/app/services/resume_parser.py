"""简历文件解析服务 - 多引擎文本提取 + 结构化信息抽取"""
import re
import io
from typing import Any

from app.services.jd_parser import TECH_SKILLS


# ── 姓氏表 ──
_SURNAMES = {
    "王", "李", "张", "刘", "陈", "杨", "黄", "赵", "周", "吴",
    "徐", "孙", "马", "朱", "胡", "郭", "何", "高", "林", "罗",
    "郑", "梁", "谢", "宋", "唐", "韩", "曹", "许", "邓", "冯",
    "萧", "程", "蔡", "彭", "潘", "袁", "于", "董", "余", "叶",
    "蒋", "杜", "苏", "魏", "吕", "丁", "任", "姚", "卢", "沈",
    "姜", "崔", "钟", "谭", "陆", "汪", "范", "金", "石", "廖",
    "贾", "夏", "韦", "付", "方", "白", "邹", "孟", "熊", "秦",
    "邱", "江", "尹", "薛", "闫", "段", "雷", "侯", "龙", "史",
    "陶", "贺", "顾", "毛", "郝", "龚", "邵", "万", "钱", "严",
    "覃", "武", "戴", "莫", "孔", "向", "汤",
    "欧阳", "司马", "上官", "夏侯", "诸葛", "司徒", "司空",
}

# ── 正则 ──
_PHONE = re.compile(r"1[3-9]\d{9}|0\d{2,3}-?\d{7,8}|1\d{10}")
_EMAIL = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
_GARBLED = re.compile(r"[�\x00\x01\x02]")

# ── 中文简历章节标题（按优先级排序） ──
_SECTION_HEADERS: list[tuple[str, str]] = [
    ("summary",    r"(个人(?:总结|简介|评价|陈述|综述)|自我(?:评价|介绍)|关于我|profile|summary)"),
    ("education",  r"(教育(?:经历|背景|信息|学历)|学(?:历|校)教育|education)"),
    ("experience", r"(工作(?:经历|经验)?|实习(?:经历|经验)?|职业经历|experience|employment)"),
    ("projects",   r"(项目(?:经历|经验|实践)?|项目|projects?)"),
    ("skills",     r"(专业(?:技能|能力|特长)|技能(?:清单|列表)?|技术(?:栈|能力)|核心技术|skills?)"),
    ("certificates", r"(证书|资格认证|资质|荣誉|奖项|获奖|certifications?|licenses?)"),
]

# 章节标题在行内的匹配（忽略开头特殊符号和空白）
_SECTION_RE = re.compile(
    r"^\s*[·•●▶\-—]*\s*(" + "|".join(
        p[1] for p in _SECTION_HEADERS
    ) + r")\s*[:：]?\s*$",
    re.IGNORECASE,
)

# 提取单行上的日期范围
_DATE_RANGE = re.compile(
    r"(\d{4}\s*[./年]\s*\d{0,2})\s*(?:[-–~至到]|至今)\s*(\d{4}\s*[./年]\s*\d{0,2}|至今)",
    re.IGNORECASE,
)


def _is_garbled(text: str) -> bool:
    if not text or len(text) < 20:
        return True
    bad = sum(1 for c in text if c in ("�", "฀") or ord(c) in (0, 1, 2))
    return bad / max(len(text), 1) > 0.05


def _clean(text: str) -> str:
    text = text.replace("\x00", "")
    text = _GARBLED.sub("", text)
    text = re.sub(r"[ \t]+", " ", text)
    # 移除孤立的空字节占位
    text = re.sub(r"(?<=\d)\s+(?=[./])", "", text)
    text = re.sub(r"(?<=[./])\s+(?=\d)", "", text)
    return text.strip()


# ══════════════════════════════════════════════════
#  多引擎文本提取
# ══════════════════════════════════════════════════

def parse_pdf(file_bytes: bytes) -> str:
    engines = [_try_pdfplumber, _try_fitz, _try_pypdf]
    best = ""
    for fn in engines:
        text = fn(file_bytes)
        if text and not _is_garbled(text):
            return _clean(text)
        if len(text) > len(best):
            best = text
    return _clean(best)


def _try_pdfplumber(file_bytes: bytes) -> str:
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages)
    except Exception:
        return ""


def _try_fitz(file_bytes: bytes) -> str:
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = "".join(p.get_text() for p in doc)
        doc.close()
        return text
    except Exception:
        return ""


def _try_pypdf(file_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(p.extract_text() or "" for p in reader.pages)
    except Exception:
        return ""


def parse_docx(file_bytes: bytes) -> str:
    import docx
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs)


# ══════════════════════════════════════════════════
#  章节拆分 & 逐段解析
# ══════════════════════════════════════════════════

def _split_sections(text: str) -> dict[str, str]:
    """将简历文本按章节标题拆分为 {section_type: content}"""
    lines = [l.strip() for l in text.split("\n")]
    sections: dict[str, str] = {}
    current_key = "header"
    current_lines: list[str] = []

    for line in lines:
        m = _SECTION_RE.match(line)
        if m:
            # 保存上一节
            if current_lines:
                sections[current_key] = "\n".join(current_lines).strip()
            # 识别新章节（找匹配的 key）
            matched_text = m.group(1).lower()
            current_key = "header"
            for key, pattern in _SECTION_HEADERS:
                if re.fullmatch(pattern, matched_text, re.IGNORECASE):
                    current_key = key
                    break
            current_lines = []
        else:
            if line and not line.startswith("http"):
                current_lines.append(line)

    if current_lines:
        sections[current_key] = "\n".join(current_lines).strip()
    return sections


def extract_info(text: str) -> dict[str, Any]:
    sections = _split_sections(text)

    # 从 header 区域提取联系信息
    header_text = sections.get("header", "")
    summary_raw = sections.get("summary", "")

    name = _extract_name(header_text, text)
    phone = _extract_phone(header_text) or _extract_phone(text)
    email = _extract_email(header_text) or _extract_email(text)
    summary = _extract_summary(header_text, summary_raw, name, phone, email)

    return {
        "name": name,
        "phone": phone,
        "email": email,
        "summary": summary,
        "skills": _extract_skills_from_section(sections.get("skills", ""), text),
        "educations": _parse_education(sections.get("education", "")),
        "work_experiences": _parse_experiences(sections.get("experience", ""), "work"),
        "projects": _parse_experiences(sections.get("projects", ""), "project"),
        "certificates": _parse_certificates(sections.get("certificates", "")),
    }


# ── 联系信息 ──

def _extract_name(header: str, full: str) -> str:
    lines = [l.strip() for l in (header or full).split("\n") if l.strip()]
    skip = {"简历", "个人", "求职", "电话", "邮箱", "手机", "姓名",
            "学历", "技能", "经验", "教育", "工作", "项目",
            "resume", "cv", "curriculum", "name",
            "个人总结", "教育信息", "实习经历", "项目经历",
            "个⼈总结", "教育信息", "奖项"}

    for line in lines[:10]:
        clean = re.sub(r"\s", "", line)
        if not clean or clean.lower() in skip:
            continue
        chinese = re.findall(r"[一-鿿]", clean)
        if len(chinese) in (2, 3) and chinese[0] in _SURNAMES:
            return "".join(chinese)

    # 宽松：首行连续 2-3 个中文字
    for line in lines[:15]:
        m = re.match(r"([一-鿿]{2,3})", line.strip())
        if m and m.group(1)[0] in _SURNAMES:
            return m.group(1)
    return ""


def _extract_phone(text: str) -> str:
    m = _PHONE.search(text)
    return m.group() if m else ""


def _extract_email(text: str) -> str:
    m = _EMAIL.search(text)
    return m.group() if m else ""


def _extract_summary(header: str, summary_section: str,
                     name: str, phone: str, email: str) -> str:
    # 优先使用独立「个人总结」章节
    if summary_section and len(summary_section) > 15:
        return summary_section[:300]

    # 从 header 中提取：定位到联系方式之后的第一段有意义的文字
    if header:
        lines = [l.strip() for l in header.split("\n") if l.strip()]
        known = {name, phone, email, ""}
        start = 0
        for i, line in enumerate(lines):
            if line in known:
                start = i + 1
                continue
            # 跳过只有数字/特殊字符的行
            if re.match(r"^[\d\s@.\-]+$", line):
                start = i + 1
                continue
            start = i
            break
        for line in lines[start:start + 8]:
            chinese = re.findall(r"[一-鿿]", line)
            if len(chinese) > 10 and len(line) > 25:
                return line[:300]
    return ""


# ── 技能 ──

def _extract_skills_from_section(section_text: str, full_text: str) -> list[str]:
    source = section_text or full_text
    found: dict[str, str] = {}
    for skill in TECH_SKILLS:
        if skill.lower() in source.lower():
            found[skill.lower()] = skill
    return sorted(found.values(),
                  key=lambda x: (x.lower() in ("java", "python", "sql"), x), reverse=True)


# ── 教育 ──

def _parse_education(text: str) -> list[dict[str, str]]:
    if not text:
        return []
    results: list[dict[str, str]] = []
    # 按空行分割成多段（可能有多段教育经历）
    blocks = re.split(r"\n\s*\n", text.strip())

    for block in blocks:
        school = _find_school(block)
        major, degree = _find_major_degree(block)
        start, end = _find_date_range(block)
        if school or degree or major:
            results.append({
                "school": school or "",
                "major": major or "",
                "degree": degree or "",
                "start_date": start or "",
                "end_date": end or "",
            })
    return results if results else []


def _find_school(text: str) -> str:
    m = re.search(r"([一-鿿]{4,}(?:大学|学院|学校|中学|分校))", text)
    return m.group(1) if m else ""


def _find_major_degree(text: str) -> tuple[str, str]:
    major = ""
    m = re.search(r"([一-鿿Ａ-Ｚa-zA-Z+/]{2,20})(?:专业|方向)", text)
    if m:
        major = m.group(1).strip()
    degree = ""
    for d in ("博士", "硕士", "本科", "大专"):
        if d in text:
            degree = d
            break
    return major, degree


def _find_date_range(text: str) -> tuple[str, str]:
    m = _DATE_RANGE.search(text)
    if m:
        start = _normalize_date(m.group(1))
        end = _normalize_date(m.group(2))
        return start, end
    return "", ""


def _normalize_date(s: str) -> str:
    s = s.strip().replace("年", ".").replace("/", ".").replace(" ", "")
    if not s:
        return s
    parts = s.split(".")
    if len(parts) == 2:
        return f"{parts[0].strip()}.{parts[1].strip().zfill(2)}"
    if len(parts) == 1 and len(parts[0]) == 4:
        return parts[0]
    return s


# ── 工作 / 项目经历 ──

# 描述性开头关键词：看到这些词开头的行大概率是描述的一部分，不是新条目名
_DESC_LEADERS = {
    "基于", "通过", "使用", "利用", "借助", "采用", "运用",
    "负责", "参与", "主导", "完成", "实现", "开发", "设计", "构建",
    "搭建", "编写", "撰写", "维护", "优化", "重构", "升级", "改进",
    "推动", "协调", "组织", "管理", "带领", "协助", "配合",
    "深入", "熟悉", "掌握", "精通", "了解",
    "提出", "制定", "规划", "建立", "制定",
    "获得", "取得", "荣获", "评为", "授予",
    "服务", "涵盖", "包括", "涉及", "覆盖", "面向",
    "主要", "专注", "从事", "致力",
    "赋能", "支撑", "支持", "保障",
    "从零", "从无", "从0",
}


def _looks_like_entry_name(line: str) -> bool:
    """判断一行文字是否可能是新的条目名称（而非描述的延续）"""
    line_stripped = line.strip()
    if not line_stripped:
        return False
    # 日期范围行不是条目名
    if _find_date_range(line_stripped) != ("", ""):
        return False
    # 纯数字/符号行不是条目名
    if re.match(r"^[\d\s/\-:.|（）()、，,，]+$", line_stripped):
        return False
    has_chinese = bool(re.search(r"[一-鿿]", line_stripped))
    if not has_chinese:
        return False
    # 以描述关键词开头 → 大概率是描述正文
    first_word = line_stripped[:2]
    if first_word in _DESC_LEADERS:
        return False
    # 包含条目名标记（| 或 ——）→ 很可能是条目名（如 "项目名 | 角色"）
    has_separator = bool(re.search(r"[|｜—–]", line_stripped[:20]))
    if has_separator:
        return True
    # 不超过10个字的短行 → 可能是角色/头衔
    if len(line_stripped) <= 10:
        return True
    # 包含数字+量化单位 → 大概率是描述（如 "服务1000+用户"、"日活500+"）
    if re.search(r"\d[\d+.kKwW]*[%倍人户家项个]", line_stripped[:30]):
        return False
    # 中等长度（≤50字）含中文 → 保守判断为可能条目名
    return len(line_stripped) <= 50


def _flush_entry(results: list, entry: dict | None,
                 name_field: str = "project_name",
                 role_field: str = "role") -> dict:
    """将当前累积的条目刷入结果列表，返回新的空条目"""
    if entry and entry.get("_name"):
        nf = entry.get("_name_field", name_field)
        rf = entry.get("_role_field", role_field)
        desc = "\n".join(entry["_desc_lines"]).strip() if entry["_desc_lines"] else ""
        results.append({
            nf: entry["_name"],
            rf: entry["_role"],
            "start_date": entry["_start"],
            "end_date": entry["_end"],
            "description": desc,
            "achievements": "",
        })
    return {
        "_name": "",
        "_role": "",
        "_start": "",
        "_end": "",
        "_desc_lines": [],
        "_name_field": name_field,
        "_role_field": role_field,
        "_has_date": False,
    }


def _parse_experiences(text: str, exp_type: str) -> list[dict[str, str]]:
    """解析一段工作或项目经历文本 -> 列表

    支持两种格式混用：
    1. 空行分隔的多个条目（原有逻辑）
    2. 同一段落内连续多个条目（新逻辑 — 通过前瞻检测自动拆分）
    """
    if not text:
        return []

    name_field = "company" if exp_type == "work" else "project_name"
    role_field = "position" if exp_type == "work" else "role"

    results: list[dict[str, str]] = []

    def _date_ahead(offset: int, max_look: int = 3) -> bool:
        """检测 lines[offset] 之后 max_look 行内是否有日期范围"""
        for j in range(offset + 1, min(offset + 1 + max_look, len(lines))):
            if _find_date_range(lines[j]) != ("", ""):
                return True
        return False

    # 先按空行粗分
    blocks = re.split(r"\n\s*\n", text.strip())

    for block in blocks:
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        if not lines:
            continue

        # 逐行扫描，智能识别条目边界
        entry = {
            "_name": "",
            "_role": "",
            "_start": "",
            "_end": "",
            "_desc_lines": [],
            "_name_field": name_field,
            "_role_field": role_field,
            "_has_date": False,
        }

        i = 0
        while i < len(lines):
            line = lines[i]
            date_range = _find_date_range(line)

            # ── 情况1：日期范围行 ──
            if date_range != ("", ""):
                if not entry["_has_date"]:
                    entry["_start"], entry["_end"] = date_range
                    entry["_has_date"] = True
                else:
                    # 第二个日期范围 → 新条目开始（前一行是条目名）
                    if i > 0 and _looks_like_entry_name(lines[i - 1]):
                        entry = _flush_entry(results, entry, name_field, role_field)
                        entry["_name"] = lines[i - 1]
                        if entry["_desc_lines"] and entry["_desc_lines"][-1] == lines[i - 1]:
                            entry["_desc_lines"].pop()
                    entry["_start"], entry["_end"] = date_range
                    entry["_has_date"] = True
                i += 1
                continue

            # ── 情况2：看起来像条目名 ──
            if _looks_like_entry_name(line):
                upcoming_date = _date_ahead(i, 2)

                # 已有名字+日期+前方有日期 → 当前条目结束，新条目开始
                if entry["_name"] and entry["_has_date"] and upcoming_date:
                    entry = _flush_entry(results, entry, name_field, role_field)
                    entry["_name"] = line
                    i += 1
                    continue

                # 还没有名字 → 本条目第一行
                if not entry["_name"]:
                    entry["_name"] = line
                    i += 1
                    continue

                # 有名字/无角色/无日期 → 可能是角色行
                if not entry["_role"] and not entry["_has_date"] and upcoming_date:
                    entry["_role"] = line
                    i += 1
                    continue

                # 否则追加到描述
                entry["_desc_lines"].append(line)
                i += 1
                continue

            # ── 情况3：普通描述行，但检查是否是新条目混杂其中 ──
            if entry["_name"] and entry["_has_date"] and _looks_like_entry_name(line):
                if _date_ahead(i, 3):
                    entry = _flush_entry(results, entry, name_field, role_field)
                    entry["_name"] = line
                    i += 1
                    continue

            entry["_desc_lines"].append(line)
            i += 1

        # 刷出最后一个条目
        _flush_entry(results, entry, name_field, role_field)

    return results


# ── 证书 ──

def _parse_certificates(text: str) -> list[dict[str, str]]:
    if not text:
        return []
    desc_keywords = {"练习", "参与", "使用", "负责", "掌握", "理解", "调试",
                     "设计", "开发", "实现", "强化", "深入", "基于", "通过"}
    results: list[dict[str, str]] = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        # 跳过页码、纯日期、描述性行
        if re.match(r"^\d{1,2}$", line):
            continue
        if re.match(r"^\d{4}[./]\d{1,2}$", line):
            continue
        if any(kw in line for kw in desc_keywords) or len(line) > 35:
            continue
        if not re.search(r"[一-鿿]", line):
            continue
        # 只在 em-dash / 中文全角破折号处分隔颁发机构
        parts = re.split(r"[—–—]\s*", line, maxsplit=1)
        name = parts[0].strip().rstrip("（(")
        issuer = parts[1].strip() if len(parts) > 1 else ""
        # 去重 + 排除只剩括号的残片 + 排除未闭合括号的行（PDF 排版断裂）
        if 3 <= len(name) <= 40 and name not in {r["name"] for r in results}:
            if not re.match(r"^[（(]\)?$", name) and not name.endswith("（"):
                results.append({"name": name, "issuer": issuer})
    return results


# ══════════════════════════════════════════════════
#  统一入口
# ══════════════════════════════════════════════════

def parse_resume_file(filename: str, file_bytes: bytes) -> dict[str, Any]:
    ext = filename.lower().split(".")[-1]
    if ext == "pdf":
        text = parse_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        text = parse_docx(file_bytes)
    else:
        raise ValueError(f"不支持的文件格式: .{ext}，仅支持 PDF 和 Word 文档")
    if not text.strip():
        raise ValueError("未能提取到任何文本内容，文件可能是扫描件或图片型 PDF")
    return extract_info(text)
