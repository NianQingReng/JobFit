import type { ResumeContent } from '../../types'
import TemplateClassic from './TemplateClassic'
import TemplateModern from './TemplateModern'
import TemplateMinimal from './TemplateMinimal'

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  component: (props: { data: ResumeContent }) => JSX.Element
  /** Extra style overrides injected during print/capture */
  printStyles?: string
}

export const templates: TemplateDefinition[] = [
  {
    id: 'classic',
    name: '经典',
    description: '传统商务风格，ATS 兼容性最佳',
    component: TemplateClassic,
  },
  {
    id: 'modern',
    name: '现代',
    description: '双栏布局，突出技能和专业性',
    component: TemplateModern,
  },
  {
    id: 'minimal',
    name: '简洁',
    description: '极简留白设计，适合创意/技术岗位',
    component: TemplateMinimal,
  },
]

export function getTemplate(id: string): TemplateDefinition {
  return templates.find(t => t.id === id) ?? templates[0]
}
