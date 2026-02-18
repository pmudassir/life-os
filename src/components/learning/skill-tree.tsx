'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Cpu, 
  Database, 
  Cloud, 
  Bot, 
  Code2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

interface SkillProgress {
  id: string
  createdAt: Date
}

interface Skill {
  id: string
  name: string
  category: string
  description?: string | null
  currentLevel: ProficiencyLevel
  targetLevel?: ProficiencyLevel
  progress: SkillProgress[]
}

interface SkillTreeProps {
  skills: Skill[]
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Backend': <Database className="w-4 h-4" />,
  'AI': <Bot className="w-4 h-4" />,
  'Distributed Systems': <Cloud className="w-4 h-4" />,
  'Frontend': <Code2 className="w-4 h-4" />,
  'default': <Cpu className="w-4 h-4" />,
}

const proficiencyColors: Record<ProficiencyLevel, string> = {
  BEGINNER: 'bg-slate-500',
  INTERMEDIATE: 'bg-blue-500',
  ADVANCED: 'bg-purple-500',
  EXPERT: 'bg-emerald-500',
}

const proficiencyLabels: Record<ProficiencyLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
}

const proficiencyLevels: ProficiencyLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

export function SkillTree({ skills }: SkillTreeProps) {
  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  if (skills.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-2xl">
        <p className="font-medium">No skills tracked yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add skills to track your proficiency growth over time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded">
                {categoryIcons[category] || categoryIcons['default']}
              </div>
              <CardTitle className="text-lg">{category}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorySkills.map((skill) => (
                <SkillItem key={skill.id} skill={skill} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SkillItem({ skill }: { skill: Skill }) {
  const currentLevel = skill.currentLevel || 'BEGINNER'
  const targetLevel = skill.targetLevel || currentLevel
  const latestProgress = skill.progress[0] || null

  const getProgressIcon = () => {
    if (!latestProgress) return <Minus className="w-4 h-4 text-muted-foreground" />
    const currentIndex = proficiencyLevels.indexOf(currentLevel)
    const previousLevel = (latestProgress as { level?: ProficiencyLevel }).level
    if (!previousLevel) return <Minus className="w-4 h-4 text-muted-foreground" />
    const previousIndex = proficiencyLevels.indexOf(previousLevel)
    
    if (currentIndex > previousIndex) {
      return <TrendingUp className="w-4 h-4 text-emerald-500" />
    } else if (currentIndex < previousIndex) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{skill.name}</p>
          {getProgressIcon()}
        </div>
        {skill.description && (
          <p className="text-sm text-muted-foreground mt-0.5">{skill.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${proficiencyColors[currentLevel]}`}>
            {proficiencyLabels[currentLevel]}
          </span>
        </div>
        {targetLevel !== currentLevel && (
          <div className="text-xs text-muted-foreground">
            → {proficiencyLabels[targetLevel]}
          </div>
        )}
      </div>
    </div>
  )
}
