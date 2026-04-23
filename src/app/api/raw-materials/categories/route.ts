import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

// GET all raw material categories
export async function GET() {
  try {
    const categories = await db.rawMaterialCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { materials: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    const category = await db.rawMaterialCategory.create({
      data: {
        id: nanoid(),
        name: data.name,
        slug,
        description: data.description || null,
        color: data.color || null,
        icon: data.icon || null,
        isActive: data.isActive ?? true,
      }
    })
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
