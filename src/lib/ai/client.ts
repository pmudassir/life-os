import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'

// Initialize AI providers
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Model configurations
export const aiModels = {
  openai: {
    'gpt-4o': openai('gpt-4o'),
    'gpt-4o-mini': openai('gpt-4o-mini'),
  },
  anthropic: {
    'claude-3-5-sonnet': anthropic('claude-3-5-sonnet-20241022'),
    'claude-3-haiku': anthropic('claude-3-haiku-20240307'),
  },
}

// Default model selection
export function getModel(provider: 'openai' | 'anthropic' = 'openai', model: string = 'gpt-4o-mini') {
  if (provider === 'anthropic') {
    return aiModels.anthropic[model as keyof typeof aiModels.anthropic] || aiModels.anthropic['claude-3-haiku']
  }
  return aiModels.openai[model as keyof typeof aiModels.openai] || aiModels.openai['gpt-4o-mini']
}

// System prompts for different contexts
export const systemPrompts = {
  general: `You are an AI career coach and productivity assistant for a software developer. 
You help with learning tracking, project management, content creation, and career development.
Be concise, actionable, and encouraging. Focus on practical advice and measurable outcomes.`,

  learning: `You are a technical learning assistant specializing in distributed systems, AI agents, and software engineering.
Help the user track their learning progress, understand complex concepts, and apply knowledge to real projects.
Reference "Designing Data-Intensive Applications" (DDIA) when relevant.
Encourage the user to write about what they learn and apply concepts immediately.`,

  project: `You are a project management assistant for a developer building SaaS products and working on distributed systems.
Help track project progress, identify blockers, and suggest next steps.
Focus on shipping real projects and measuring outcomes.`,

  content: `You are a content strategy assistant helping a developer build their public profile.
Suggest content ideas based on their learning and projects.
Help with LinkedIn posts, Twitter threads, blog posts, and video scripts.
Focus on demonstrating expertise in distributed systems and AI agents.`,

  planning: `You are a weekly planning assistant helping optimize a developer's schedule.
Balance deep work, learning, project work, content creation, and rest.
Reference the user's 6-month and 12-month checkpoint goals.`,
}
