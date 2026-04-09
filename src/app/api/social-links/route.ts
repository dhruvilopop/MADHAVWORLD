import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch all social links
export async function GET() {
  try {
    const links = await db.socialLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(links)
  } catch (error) {
    console.error('Error fetching social links:', error)
    return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 })
  }
}

// POST - Create new social link
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const link = await db.socialLink.create({
      data: {
        id: randomUUID(),
        platform: data.platform,
        url: data.url,
        icon: data.icon || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder || 0,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error('Error creating social link:', error)
    return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 })
  }
}

// PUT - Update social link
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    const link = await db.socialLink.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Error updating social link:', error)
    return NextResponse.json({ error: 'Failed to update social link' }, { status: 500 })
  }
}

// DELETE - Delete social link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    await db.socialLink.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting social link:', error)
    return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 })
  }
}
