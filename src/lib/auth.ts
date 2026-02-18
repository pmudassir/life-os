import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE_NAME = 'life_os_session'
const DEV_USER_ID = process.env.DEV_USER_ID ?? 'temp-user-001'
const DEV_USER_EMAIL = process.env.DEV_USER_EMAIL ?? 'temp@life-os.dev'
const DEV_USER_NAME = process.env.DEV_USER_NAME ?? 'Life OS User'

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
}

export interface Session {
  user: User
}

function createSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function safeCompare(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function decodeSessionToken(token: string): Session | null {
  const secret = process.env.AUTH_SECRET
  if (!secret) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [encodedPayload, signature] = parts
  const expected = createSignature(encodedPayload, secret)
  if (!safeCompare(signature, expected)) return null

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      sub?: string
      email?: string
      name?: string | null
      image?: string | null
      exp?: number
    }

    if (!payload.sub || !payload.email) return null
    if (payload.exp && Date.now() >= payload.exp * 1000) return null

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name ?? null,
        image: payload.image ?? null,
      },
    }
  } catch {
    return null
  }
}

function getDevelopmentSession(): Session {
  return {
    user: {
      id: DEV_USER_ID,
      email: DEV_USER_EMAIL,
      name: DEV_USER_NAME,
      image: null,
    },
  }
}

export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (token) {
    const decoded = decodeSessionToken(token)
    if (decoded) {
      return decoded
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    return getDevelopmentSession()
  }

  return null
}

async function ensureUserExists(user: User): Promise<string> {
  const existingById = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  })
  if (existingById) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name ?? undefined,
        image: user.image ?? undefined,
      },
    })
    return existingById.id
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true },
  })
  if (existingByEmail) {
    await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        name: user.name ?? undefined,
        image: user.image ?? undefined,
      },
    })
    return existingByEmail.id
  }

  const created = await prisma.user.create({
    data: {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      image: user.image ?? undefined,
    },
    select: { id: true },
  })
  return created.id
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function requireUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  return ensureUserExists(session.user)
}
