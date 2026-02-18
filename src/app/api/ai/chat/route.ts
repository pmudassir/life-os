import { NextRequest, NextResponse } from 'next/server'
import { buildUserContext } from '@/lib/ai/context'
import { requireUserId } from '@/lib/auth'
import { z } from 'zod'

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(4000),
      })
    )
    .min(1)
    .max(50),
  contextType: z.enum(['general', 'learning', 'project', 'content', 'planning']).default('general'),
})

// Simple AI chat route - responds with context-aware suggestions
// Replace with actual AI provider (OpenAI/Anthropic) in production
export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId()
    const parsed = chatRequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
    }
    const { messages, contextType } = parsed.data

    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || ''
    if (!lastMessage) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    // Build user context
    const userContext = await buildUserContext(userId, contextType)

    // Generate a context-aware response
    const response = generateResponse(lastMessage, userContext)

    return NextResponse.json({ content: response })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('AI Chat Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function generateResponse(
  message: string, 
  context: Awaited<ReturnType<typeof buildUserContext>>
): string {
  const lowerMessage = message.toLowerCase()

  // Learning-related questions
  if (lowerMessage.includes('focus') || lowerMessage.includes('today')) {
    if (context.learning.includes('DDIA')) {
      return "Based on your current learning progress, I suggest focusing on your DDIA studies today. You've been making good progress - try to complete another chapter or review the concepts from your last session. Consider allocating 2 hours of focused study time."
    }
    return "I recommend dedicating focused time to your highest priority learning resource today. Try the Pomodoro technique - 25 minutes of focused study followed by a 5-minute break."
  }

  // Goals-related questions
  if (lowerMessage.includes('goal') || lowerMessage.includes('progress')) {
    if (context.goals) {
      return `Here's a summary of your goals:\n\n${context.goals}\n\nConsider reviewing your progress weekly and adjusting your approach if needed. Breaking down large goals into smaller milestones can help maintain momentum.`
    }
    return "You haven't set up any goals yet. I recommend starting with 6-month checkpoints for your key areas: technical skills, projects, and personal development."
  }

  // Content-related questions
  if (lowerMessage.includes('content') || lowerMessage.includes('ideas')) {
    return `Here are some content ideas based on your learning:\n\n1. Share insights from your current studies - what's the most interesting concept you've learned recently?\n2. Document your project journey - write about challenges you've overcome\n3. Create a tutorial based on something you've mastered\n4. Share your weekly reflections on learning in public\n\nConsistency matters more than perfection. Start with one piece per week.`
  }

  // Project-related questions
  if (lowerMessage.includes('project') || lowerMessage.includes('work')) {
    if (context.projects) {
      return `Your active projects:\n\n${context.projects}\n\nConsider time-boxing your project work and logging progress to identify patterns in your productivity.`
    }
    return "You don't have any active projects tracked. Consider adding your current projects to better track your time and progress."
  }

  // Default helpful response
  return "I'm here to help with your career and learning journey. You can ask me about:\n\n- What to focus on today\n- Your goal progress\n- Content creation ideas\n- Project management advice\n- Learning recommendations\n\nWhat would you like to explore?"
}
