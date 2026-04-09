import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// Authentication module - v2 with session storage

// Simple token generation
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Simple ID generation
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Store active sessions in memory (simple approach for demo)
const activeSessions = new Map<string, { username: string; createdAt: number }>()

// Clean up old sessions every hour
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of activeSessions.entries()) {
    if (now - session.createdAt > 7 * 24 * 60 * 60 * 1000) { // 7 days
      activeSessions.delete(token)
    }
  }
}, 60 * 60 * 1000)

// GET - Check auth status
export async function GET(request: NextRequest) {
  try {
    // Check for token in Authorization header first (for localStorage-based auth)
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.replace('Bearer ', '')
    
    // Also check cookie
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get('admin_token')?.value
    
    const token = headerToken || cookieToken
    
    console.log('Auth check - header token:', headerToken ? 'present' : 'missing', 'cookie token:', cookieToken ? 'present' : 'missing')
    
    if (!token) {
      return NextResponse.json({ authenticated: false, reason: 'no_token' })
    }
    
    // Check if session exists
    const session = activeSessions.get(token)
    if (!session) {
      return NextResponse.json({ authenticated: false, reason: 'invalid_session' })
    }
    
    return NextResponse.json({ authenticated: true, admin: { username: session.username } })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false, reason: 'error' })
  }
}

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    // Ensure default admin exists with correct credentials
    let defaultAdmin = await db.admin.findUnique({
      where: { username: 'madhavbag' }
    })
    
    if (!defaultAdmin) {
      // Create default admin with proper ID
      defaultAdmin = await db.admin.create({
        data: {
          id: generateId(),
          username: 'madhavbag',
          password: '1122334455',
          updatedAt: new Date()
        }
      })
    } else if (defaultAdmin.password !== '1122334455') {
      // Update password to default if it was changed
      defaultAdmin = await db.admin.update({
        where: { username: 'madhavbag' },
        data: { password: '1122334455', updatedAt: new Date() }
      })
    }
    
    // Find admin user by the provided username
    let admin = await db.admin.findUnique({
      where: { username }
    })
    
    // If no admin found with this username
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Check password
    if (admin.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const token = generateToken()
    
    // Store session in memory
    activeSessions.set(token, { username: admin.username, createdAt: Date.now() })
    
    // Try to set cookie as well
    try {
      const cookieStore = await cookies()
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
    } catch (e) {
      console.log('Could not set cookie:', e)
    }
    
    console.log('Login successful for:', admin.username, 'token:', token.substring(0, 8) + '...')
    
    // Return token in response body for localStorage storage
    return NextResponse.json({ 
      success: true, 
      token, // Return token for localStorage
      admin: { username: admin.username } 
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

// DELETE - Logout
export async function DELETE(request: NextRequest) {
  try {
    // Get token from header or cookie
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.replace('Bearer ', '')
    
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get('admin_token')?.value
    
    const token = headerToken || cookieToken
    
    if (token) {
      activeSessions.delete(token)
    }
    
    cookieStore.delete('admin_token')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
