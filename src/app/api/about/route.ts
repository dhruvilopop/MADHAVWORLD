import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch about content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    
    if (section) {
      const content = await db.aboutContent.findUnique({
        where: { section }
      })
      return NextResponse.json(content)
    }
    
    const allContent = await db.aboutContent.findMany()
    return NextResponse.json(allContent)
  } catch (error) {
    console.error('Error fetching about content:', error)
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 })
  }
}

// POST - Create about content
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const content = await db.aboutContent.create({ data })
    
    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    console.error('Error creating about content:', error)
    return NextResponse.json({ error: 'Failed to create about content' }, { status: 500 })
  }
}

// PUT - Update about content
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, section, ...updateData } = data
    
    let content
    if (id) {
      content = await db.aboutContent.update({
        where: { id },
        data: updateData
      })
    } else if (section) {
      content = await db.aboutContent.upsert({
        where: { section },
        create: { section, ...updateData },
        update: updateData
      })
    } else {
      return NextResponse.json({ error: 'ID or section is required' }, { status: 400 })
    }
    
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error updating about content:', error)
    return NextResponse.json({ error: 'Failed to update about content' }, { status: 500 })
  }
}
