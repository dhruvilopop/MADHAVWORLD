import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const PDF_SERVICE_URL = 'http://localhost:5001/generate-quote-pdf'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Fetch quote data
    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        QuoteItem: true,
      },
    })
    
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    
    // Fetch site settings
    let settings = await db.siteSetting.findFirst()
    if (!settings) {
      settings = {
        id: 'default',
        companyName: 'Madhav World Bags Industry',
        companyLogo: null,
        address: 'Industrial Area, Bag Manufacturing Hub, India',
        phone: '+91 98765 43210',
        email: 'info@madhavworldbags.com',
        description: 'Premium quality bags manufacturer',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    
    // Call PDF service
    const response = await fetch(PDF_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quote: {
          ...quote,
          createdAt: quote.createdAt.toISOString(),
          updatedAt: quote.updatedAt.toISOString(),
          validUntil: quote.validUntil?.toISOString() || null,
          QuoteItem: quote.QuoteItem.map(item => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          })),
        },
        settings: {
          companyName: settings.companyName,
          companyLogo: settings.companyLogo,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
        },
      }),
    })
    
    if (!response.ok) {
      throw new Error('PDF generation failed')
    }
    
    const pdfBuffer = await response.arrayBuffer()
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${quote.quoteNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
