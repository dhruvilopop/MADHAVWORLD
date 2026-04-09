import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const product = await db.product.findUnique({
      where: { slug },
      include: { Category: true }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Get related products (same category or random)
    let relatedProducts = []
    
    if (product.categoryId) {
      relatedProducts = await db.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true
        },
        take: 4
      })
    }
    
    // If not enough related products, get featured ones
    if (relatedProducts.length < 4) {
      const additionalProducts = await db.product.findMany({
        where: {
          id: { not: product.id },
          isActive: true,
          NOT: { id: { in: relatedProducts.map(p => p.id) } }
        },
        take: 4 - relatedProducts.length
      })
      relatedProducts = [...relatedProducts, ...additionalProducts]
    }
    
    return NextResponse.json({ product, relatedProducts })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
