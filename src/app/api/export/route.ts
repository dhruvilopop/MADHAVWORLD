import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Export products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const type = searchParams.get('type') || 'products'

    if (type === 'products') {
      const products = await db.product.findMany({
        include: { Category: true },
        orderBy: { createdAt: 'desc' }
      })

      const exportData = products.map(p => ({
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price || '',
        image: p.image,
        material: p.material || '',
        bagStyle: p.bagStyle || '',
        gsm: p.gsm || '',
        bagSize: p.bagSize || '',
        handleType: p.handleType || '',
        bagColor: p.bagColor || '',
        printType: p.printType || '',
        capacity: p.capacity || '',
        minOrderQuantity: p.minOrderQuantity,
        stock: p.stock,
        lowStockAlert: p.lowStockAlert,
        category: p.Category?.name || '',
        isActive: p.isActive,
        isFeatured: p.isFeatured
      }))

      if (format === 'csv') {
        const headers = Object.keys(exportData[0] || {}).join(',')
        const rows = exportData.map(p => Object.values(p).map(v => `"${v}"`).join(',')).join('\n')
        const csv = `${headers}\n${rows}`
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="products-export.csv"'
          }
        })
      }

      return NextResponse.json(exportData)
    }

    if (type === 'customers') {
      const customers = await db.customer.findMany({
        orderBy: { createdAt: 'desc' }
      })

      const exportData = customers.map(c => ({
        name: c.name,
        email: c.email || '',
        phone: c.phone,
        address: c.address || '',
        company: c.company || '',
        gstNumber: c.gstNumber || '',
        group: c.group,
        totalOrders: c.totalOrders,
        totalSpent: c.totalSpent,
        lastOrderAt: c.lastOrderAt || ''
      }))

      if (format === 'csv') {
        const headers = Object.keys(exportData[0] || {}).join(',')
        const rows = exportData.map(c => Object.values(c).map(v => `"${v}"`).join(',')).join('\n')
        const csv = `${headers}\n${rows}`
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="customers-export.csv"'
          }
        })
      }

      return NextResponse.json(exportData)
    }

    if (type === 'orders') {
      const orders = await db.order.findMany({
        include: { OrderItem: true },
        orderBy: { createdAt: 'desc' }
      })

      const exportData = orders.map(o => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail || '',
        customerPhone: o.customerPhone,
        subtotal: o.subtotal,
        tax: o.tax,
        discount: o.discount,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        orderDate: o.orderDate,
        items: o.OrderItem.length
      }))

      if (format === 'csv') {
        const headers = Object.keys(exportData[0] || {}).join(',')
        const rows = exportData.map(o => Object.values(o).map(v => `"${v}"`).join(',')).join('\n')
        const csv = `${headers}\n${rows}`
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="orders-export.csv"'
          }
        })
      }

      return NextResponse.json(exportData)
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}

// POST - Import products
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { type, items } = data

    if (type === 'products' && Array.isArray(items)) {
      let imported = 0
      let skipped = 0

      for (const item of items) {
        try {
          // Check if product with slug exists
          const existing = await db.product.findUnique({
            where: { slug: item.slug }
          })

          if (existing) {
            skipped++
            continue
          }

          // Find category
          let categoryId = null
          if (item.category) {
            const category = await db.category.findFirst({
              where: { 
                OR: [
                  { name: { equals: item.category, mode: 'insensitive' } },
                  { slug: item.category.toLowerCase().replace(/\s+/g, '-') }
                ]
              }
            })
            if (category) categoryId = category.id
          }

          await db.product.create({
            data: {
              id: randomUUID(),
              name: item.name,
              slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              description: item.description || '',
              price: item.price ? parseFloat(item.price) : null,
              image: item.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600',
              material: item.material || null,
              bagStyle: item.bagStyle || null,
              gsm: item.gsm || null,
              bagSize: item.bagSize || null,
              handleType: item.handleType || null,
              bagColor: item.bagColor || null,
              printType: item.printType || null,
              capacity: item.capacity || null,
              minOrderQuantity: parseInt(item.minOrderQuantity) || 1000,
              stock: parseInt(item.stock) || 0,
              lowStockAlert: parseInt(item.lowStockAlert) || 10,
              categoryId,
              isActive: item.isActive !== 'false',
              isFeatured: item.isFeatured === 'true',
              updatedAt: new Date()
            }
          })
          imported++
        } catch (e) {
          console.error('Error importing product:', e)
          skipped++
        }
      }

      return NextResponse.json({ 
        message: `Import complete: ${imported} imported, ${skipped} skipped`,
        imported,
        skipped
      })
    }

    return NextResponse.json({ error: 'Invalid import type' }, { status: 400 })
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 })
  }
}
