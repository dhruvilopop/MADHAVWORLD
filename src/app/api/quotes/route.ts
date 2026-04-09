import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET all quotes
export async function GET() {
  try {
    const quotes = await db.quote.findMany({
      include: {
        Customer: true,
        QuoteItem: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json([])
  }
}

// POST create new quote
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const quoteNumber = `QT-${String(Date.now()).slice(-6)}`
    const quoteId = randomUUID()
    
    const quote = await db.quote.create({
      data: {
        id: quoteId,
        quoteNumber,
        customerId: data.customerId || null,
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
        status: 'draft',
        updatedAt: new Date(),
      }
    })

    // Create quote items
    if (data.items && data.items.length > 0) {
      for (const item of data.items as { productId: string | null; productName: string; quantity: number; price: number; isCustom?: boolean; customSpecs?: string }[]) {
        await db.quoteItem.create({
          data: {
            id: randomUUID(),
            quoteId: quoteId,
            productId: item.productId || null,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            isCustom: item.isCustom || false,
            customSpecs: item.customSpecs || null,
          }
        })
      }
    }

    // Fetch the complete quote with items
    const completeQuote = await db.quote.findUnique({
      where: { id: quoteId },
      include: {
        QuoteItem: true,
      }
    })

    return NextResponse.json(completeQuote)
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
