import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch theme settings
export async function GET() {
  try {
    let theme = await db.themeSetting.findFirst()

    // Create default theme if not exists
    if (!theme) {
      theme = await db.themeSetting.create({
        data: {
          id: randomUUID(),
          primaryColor: '#f59e0b',
          accentColor: '#d97706',
          fontFamily: 'Inter',
          borderRadius: '0.75rem',
          customCSS: null,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error fetching theme settings:', error)
    return NextResponse.json({ error: 'Failed to fetch theme settings' }, { status: 500 })
  }
}

// PUT - Update theme settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Get existing theme or create
    let theme = await db.themeSetting.findFirst()

    if (theme) {
      theme = await db.themeSetting.update({
        where: { id: theme.id },
        data: {
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
          fontFamily: data.fontFamily,
          borderRadius: data.borderRadius,
          customCSS: data.customCSS || null,
          updatedAt: new Date()
        }
      })
    } else {
      theme = await db.themeSetting.create({
        data: {
          id: randomUUID(),
          primaryColor: data.primaryColor || '#f59e0b',
          accentColor: data.accentColor || '#d97706',
          fontFamily: data.fontFamily || 'Inter',
          borderRadius: data.borderRadius || '0.75rem',
          customCSS: data.customCSS || null,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error updating theme settings:', error)
    return NextResponse.json({ error: 'Failed to update theme settings' }, { status: 500 })
  }
}
