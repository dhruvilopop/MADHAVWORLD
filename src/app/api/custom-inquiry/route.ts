import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all custom inquiries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }
    
    const inquiries = await db.customInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(inquiries)
  } catch (error) {
    console.error('Error fetching custom inquiries:', error)
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}

// POST - Create new custom inquiry
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const inquiry = await db.customInquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        style: data.style || '',
        color: data.color || '',
        material: data.material || '',
        handleType: data.handleType || '',
        size: data.size || '',
        print: data.print || '',
        quantity: data.quantity || 1,
        customNotes: data.customNotes || null,
      }
    })
    
    return NextResponse.json(inquiry, { status: 201 })
  } catch (error) {
    console.error('Error creating custom inquiry:', error)
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 })
  }
}

// PUT - Update custom inquiry status
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const inquiry = await db.customInquiry.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(inquiry)
  } catch (error) {
    console.error('Error updating custom inquiry:', error)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
}

// DELETE - Delete custom inquiry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 })
    }
    
    await db.customInquiry.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting custom inquiry:', error)
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 })
  }
}
