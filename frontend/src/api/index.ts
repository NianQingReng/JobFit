import type { JD, MatchResult, Resume, User } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

// User API
export const userApi = {
  list: () => request<User[]>('/users'),
  get: (id: number) => request<User>(`/users/${id}`),
  create: (data: Partial<User>) => request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<User>) => request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/users/${id}`, { method: 'DELETE' }),

  addWorkExp: (userId: number, data: any) =>
    request(`/users/${userId}/work-experiences`, { method: 'POST', body: JSON.stringify(data) }),
  updateWorkExp: (expId: number, data: any) =>
    request(`/users/work-experiences/${expId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkExp: (expId: number) =>
    request(`/users/work-experiences/${expId}`, { method: 'DELETE' }),

  addEducation: (userId: number, data: any) =>
    request(`/users/${userId}/educations`, { method: 'POST', body: JSON.stringify(data) }),
  deleteEducation: (eduId: number) =>
    request(`/users/educations/${eduId}`, { method: 'DELETE' }),

  addSkill: (userId: number, data: any) =>
    request(`/users/${userId}/skills`, { method: 'POST', body: JSON.stringify(data) }),
  deleteSkill: (skillId: number) =>
    request(`/users/skills/${skillId}`, { method: 'DELETE' }),

  addCertificate: (userId: number, data: any) =>
    request(`/users/${userId}/certificates`, { method: 'POST', body: JSON.stringify(data) }),
  deleteCertificate: (certId: number) =>
    request(`/users/certificates/${certId}`, { method: 'DELETE' }),

  addProject: (userId: number, data: any) =>
    request(`/users/${userId}/projects`, { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (projId: number, data: any) =>
    request(`/users/projects/${projId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (projId: number) =>
    request(`/users/projects/${projId}`, { method: 'DELETE' }),

  uploadResume: (userId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return fetch(`${BASE}/users/${userId}/upload-resume`, { method: 'POST', body: formData }).then(r => r.json())
  },
}

// JD API
export const jdApi = {
  list: () => request<JD[]>('/jds'),
  get: (id: number) => request<JD>(`/jds/${id}`),
  create: (data: { title: string; company: string; raw_text: string }) =>
    request<JD>('/jds', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/jds/${id}`, { method: 'DELETE' }),
  match: (userId: number, jdId: number) =>
    request<MatchResult>('/jds/match', { method: 'POST', body: JSON.stringify({ user_id: userId, jd_id: jdId }) }),
}

// Resume API
export const resumeApi = {
  list: (userId?: number) => request<Resume[]>(`/resumes${userId ? `?user_id=${userId}` : ''}`),
  get: (id: number) => request<Resume>(`/resumes/${id}`),
  generate: (userId: number, jdId: number) =>
    request<Resume>(`/resumes/generate?user_id=${userId}&jd_id=${jdId}`, { method: 'POST' }),
  delete: (id: number) => request(`/resumes/${id}`, { method: 'DELETE' }),
  update: (id: number, data: any) =>
    request<Resume>(`/resumes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  rewrite: (originalText: string, jdKeywords: string[], count = 3) =>
    request<{ versions: string[] }>('/resumes/rewrite', {
      method: 'POST',
      body: JSON.stringify({ original_text: originalText, jd_keywords: jdKeywords, count }),
    }),
}
