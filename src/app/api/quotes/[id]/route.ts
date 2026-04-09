import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single quote by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        Customer: true,
        QuoteItem: true,
      },
    })
    
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    
    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

// PUT update quote
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const quote = await db.quote.update({
      where: { id },
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone,
        subtotal: data.subtotal || 0,
        tax: data.tax || 0,
        discount: data.discount || 0,
        total: data.total,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes || null,
        terms: data.terms || null,
        status: data.status || 'draft',
        updatedAt: new Date(),
      },
      include: {
        QuoteItem: true,
      }
    })
    
    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}

// DELETE quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.quoteItem.deleteMany({
      where: { quoteId: id }
    })
    
    await db.quote.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
  }
}
