import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch all reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const approved = searchParams.get('approved')

    const where: Record<string, unknown> = {}
    if (productId) {
      where.productId = productId
    }
    if (approved === 'true') {
      where.isApproved = true
    }

    const reviews = await db.productReview.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST - Create new review
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const review = await db.productReview.create({
      data: {
        id: randomUUID(),
        productId: data.productId,
        customerId: data.customerId || null,
        customerName: data.customerName,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        isVerified: false,
        isApproved: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

// PUT - Update review (for approval)
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    const review = await db.productReview.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

// DELETE - Delete review
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
    }

    await db.productReview.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
