import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch all FAQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active')

    const where: Record<string, unknown> = {}
    if (category) {
      where.category = category
    }
    if (activeOnly === 'true') {
      where.isActive = true
    }

    const faqs = await db.fAQ.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json(faqs)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

// POST - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const faq = await db.fAQ.create({
      data: {
        id: randomUUID(),
        question: data.question,
        answer: data.answer,
        category: data.category || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
}

// PUT - Update FAQ
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    const faq = await db.fAQ.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 })
  }
}

// DELETE - Delete FAQ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 })
    }

    await db.fAQ.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 })
  }
}
