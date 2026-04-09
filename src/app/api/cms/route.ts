import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch CMS page by slug or all pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      const page = await db.cMSPage.findUnique({
        where: { slug }
      })
      return NextResponse.json(page)
    }

    const pages = await db.cMSPage.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching CMS pages:', error)
    return NextResponse.json({ error: 'Failed to fetch CMS pages' }, { status: 500 })
  }
}

// POST - Create new CMS page
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const page = await db.cMSPage.create({
      data: {
        id: randomUUID(),
        slug: data.slug,
        title: data.title,
        content: data.content,
        metaTitle: data.metaTitle || null,
        metaDesc: data.metaDesc || null,
        isActive: data.isActive ?? true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Error creating CMS page:', error)
    return NextResponse.json({ error: 'Failed to create CMS page' }, { status: 500 })
  }
}

// PUT - Update CMS page
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    const page = await db.cMSPage.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error updating CMS page:', error)
    return NextResponse.json({ error: 'Failed to update CMS page' }, { status: 500 })
  }
}

// DELETE - Delete CMS page
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 })
    }

    await db.cMSPage.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting CMS page:', error)
    return NextResponse.json({ error: 'Failed to delete CMS page' }, { status: 500 })
  }
}
