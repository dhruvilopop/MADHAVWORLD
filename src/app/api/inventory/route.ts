import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch inventory/stock data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'products' or 'materials'
    
    if (type === 'materials') {
      const materials = await db.material.findMany({
        include: {
          MaterialStockHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { name: 'asc' }
      })
      return NextResponse.json(materials)
    }
    
    // Get products with stock info
    const products = await db.product.findMany({
      where: { isActive: true },
      include: {
        StockHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { name: 'asc' }
    })
    
    // Calculate stock stats
    const stats = {
      totalProducts: products.length,
      inStock: products.filter(p => p.stock > 0).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock <= p.lowStockAlert).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + (p.price || 0) * p.stock, 0),
    }
    
    return NextResponse.json({ products, stats })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ products: [], stats: {} })
  }
}

// PATCH - Update stock
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const { productId, quantity, type, reason, reference } = data
    
    // Get current product
    const product = await db.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    const newStock = type === 'in' 
      ? product.stock + quantity 
      : product.stock - quantity
    
    if (newStock < 0) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }
    
    // Update product stock
    const updated = await db.product.update({
      where: { id: productId },
      data: { stock: newStock }
    })
    
    // Create stock history
    await db.stockHistory.create({
      data: {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        productId,
        type,
        quantity,
        reason,
        reference
      }
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating stock:', error)
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 })
  }
}
