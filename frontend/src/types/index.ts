export interface WorkExperience {
  id: number
  user_id: number
  company: string
  position: string
  start_date: string
  end_date: string | null
  description: string
  achievements: string
}

export interface Education {
  id: number
  user_id: number
  school: string
  degree: string
  major: string
  start_date: string
  end_date: string | null
}

export interface Skill {
  id: number
  user_id: number
  name: string
  level: string
}

export interface Certificate {
  id: number
  user_id: number
  name: string
  issuer: string
  date_obtained: string | null
}

export interface ProjectExperience {
  id: number
  user_id: number
  project_name: string
  role: string
  start_date: string
  end_date: string | null
  description: string
  achievements: string
  tech_stack: string
}

export interface User {
  id: number
  name: string
  phone: string
  email: string
  title: string
  summary: string
  created_at: string
  updated_at: string
  work_experiences: WorkExperience[]
  educations: Education[]
  skills: Skill[]
  certificates: Certificate[]
  project_experiences: ProjectExperience[]
}

export interface JD {
  id: number
  title: string
  company: string
  raw_text: string
  parsed_requirements: string | null
  parsed_responsibilities: string | null
  parsed_soft_skills: string | null
  created_at: string
}

export interface MatchResult {
  jd_id: number
  user_id: number
  score: number
  matched_items: MatchItem[]
  missing_items: MatchItem[]
  optimizable_items: MatchItem[]
  suggestions: string
  created_at: string
}

export interface MatchItem {
  type: string
  item: string
  detail: string
}

export interface Resume {
  id: number
  user_id: number
  jd_id: number | null
  title: string
  content: string
  style_template: string
  created_at: string
  updated_at: string
}

export interface ResumeContent {
  personal: {
    name: string
    phone: string
    email: string
    title: string
  }
  summary: string
  education: Array<{
    school: string
    degree: string
    major: string
    start_date: string
    end_date: string
  }>
  work_experience: Array<{
    company: string
    position: string
    start_date: string
    end_date: string
    description: string
    achievements: string
  }>
  projects: Array<{
    project_name: string
    role: string
    start_date: string
    end_date: string
    description: string
    achievements: string
    tech_stack: string
  }>
  skills: Array<{ name: string; level: string }>
  certificates: Array<{ name: string; issuer: string }>
}
