import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch gallery images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const all = searchParams.get('all')
    
    // If 'all' param is true, fetch all images including inactive (for admin)
    const where: Record<string, unknown> = all === 'true' ? {} : { isActive: true }
    if (category) {
      where.category = category
    }
    
    const images = await db.galleryImage.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}

// POST - Create gallery image
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const image = await db.galleryImage.create({
      data: {
        id: randomUUID(),
        title: data.title,
        description: data.description || null,
        image: data.image,
        category: data.category || null,
        isActive: data.isActive ?? true,
        updatedAt: new Date(),
      }
    })
    
    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Error creating gallery image:', error)
    return NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 })
  }
}

// PUT - Update gallery image
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const image = await db.galleryImage.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      }
    })
    
    return NextResponse.json(image)
  } catch (error) {
    console.error('Error updating gallery image:', error)
    return NextResponse.json({ error: 'Failed to update gallery image' }, { status: 500 })
  }
}

// DELETE - Delete gallery image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }
    
    await db.galleryImage.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 })
  }
}
