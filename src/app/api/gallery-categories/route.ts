import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch all gallery categories
export async function GET() {
  try {
    const categories = await db.galleryCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching gallery categories:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery categories' }, { status: 500 })
  }
}

// POST - Create new gallery category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const category = await db.galleryCategory.create({
      data: {
        id: randomUUID(),
        name: data.name,
        slug,
        description: data.description || null,
        image: data.image || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating gallery category:', error)
    return NextResponse.json({ error: 'Failed to create gallery category' }, { status: 500 })
  }
}

// PUT - Update gallery category
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    const category = await db.galleryCategory.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating gallery category:', error)
    return NextResponse.json({ error: 'Failed to update gallery category' }, { status: 500 })
  }
}

// DELETE - Delete gallery category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    await db.galleryCategory.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery category:', error)
    return NextResponse.json({ error: 'Failed to delete gallery category' }, { status: 500 })
  }
}
