import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all enquiries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }
    
    const enquiries = await db.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(enquiries)
  } catch (error) {
    console.error('Error fetching enquiries:', error)
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 })
  }
}

// POST - Create new enquiry (from contact form)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const enquiry = await db.enquiry.create({ data })
    
    return NextResponse.json(enquiry, { status: 201 })
  } catch (error) {
    console.error('Error creating enquiry:', error)
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}

// PUT - Update enquiry status
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const enquiry = await db.enquiry.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(enquiry)
  } catch (error) {
    console.error('Error updating enquiry:', error)
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 })
  }
}

// DELETE - Delete enquiry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Enquiry ID is required' }, { status: 400 })
    }
    
    await db.enquiry.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting enquiry:', error)
    return NextResponse.json({ error: 'Failed to delete enquiry' }, { status: 500 })
  }
}
