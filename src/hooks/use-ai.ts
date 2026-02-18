'use client'

import { useState, useCallback } from 'react'

interface AIRecommendation {
  id: string
  type: string
  title: string
  description: string
  priority: number
}

interface UseAIProps {
  userId: string
}

export function useAI({ userId }: UseAIProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInsights = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const data = await response.json()
      setRecommendations(data.recommendations)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const dismissRecommendation = useCallback(async (recommendationId: string) => {
    try {
      await fetch('/api/ai/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recommendationId, 
          status: 'dismissed' 
        }),
      })

      setRecommendations(prev => 
        prev.filter(r => r.id !== recommendationId)
      )
    } catch (err) {
      console.error('Failed to dismiss recommendation:', err)
    }
  }, [])

  const acceptRecommendation = useCallback(async (recommendationId: string) => {
    try {
      await fetch('/api/ai/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recommendationId, 
          status: 'accepted' 
        }),
      })

      setRecommendations(prev => 
        prev.filter(r => r.id !== recommendationId)
      )
    } catch (err) {
      console.error('Failed to accept recommendation:', err)
    }
  }, [])

  return {
    recommendations,
    isLoading,
    error,
    generateInsights,
    dismissRecommendation,
    acceptRecommendation,
  }
}
