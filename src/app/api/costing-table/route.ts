import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

// GET all costing table entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gsm = searchParams.get('gsm')
    const width = searchParams.get('width')
    const height = searchParams.get('height')
    
    const where: any = { isActive: true }
    
    if (gsm) {
      where.gsm = parseFloat(gsm)
    }
    
    const entries = await db.costingTable.findMany({
      where,
      orderBy: [
        { gsm: 'asc' },
        { sizeWidth: 'asc' },
        { sizeHeight: 'asc' }
      ]
    })
    
    // Filter by dimensions if provided
    let result = entries
    if (width && height) {
      const w = parseFloat(width)
      const h = parseFloat(height)
      result = entries.filter(e => e.sizeWidth === w && e.sizeHeight === h)
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching costing table:', error)
    return NextResponse.json({ error: 'Failed to fetch costing table' }, { status: 500 })
  }
}

// POST create new costing table entry
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Calculate derived values
    const sizeWidth = parseFloat(data.sizeWidth)
    const sizeHeight = parseFloat(data.sizeHeight)
    const gsm = parseFloat(data.gsm)
    const weightPerBag = parseFloat(data.weightPerBag)
    
    // Area in square meters (convert inches to meters: 1 inch = 0.0254 meters)
    const widthM = sizeWidth * 0.0254
    const heightM = sizeHeight * 0.0254
    const areaSqm = widthM * heightM
    
    // Bags per KG = 1000 / weight per bag (in grams)
    const bagsPerKg = 1000 / weightPerBag
    
    const entry = await db.costingTable.create({
      data: {
        id: nanoid(),
        sizeWidth,
        sizeHeight,
        gsm,
        weightPerBag,
        bagsPerKg,
        areaSqm,
        materialType: data.materialType || null,
        costPerBag: data.costPerBag ? parseFloat(data.costPerBag) : null,
        sellingPrice: data.sellingPrice ? parseFloat(data.sellingPrice) : null,
        notes: data.notes || null,
        isActive: data.isActive ?? true,
      }
    })
    
    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error creating costing table entry:', error)
    return NextResponse.json({ error: 'Failed to create costing table entry' }, { status: 500 })
  }
}

// PUT - Bulk import costing table entries
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const entries = data.entries
    
    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: 'Entries must be an array' }, { status: 400 })
    }
    
    const results = []
    
    for (const entry of entries) {
      const sizeWidth = parseFloat(entry.sizeWidth)
      const sizeHeight = parseFloat(entry.sizeHeight)
      const gsm = parseFloat(entry.gsm)
      const weightPerBag = parseFloat(entry.weightPerBag)
      const bagsPerKg = 1000 / weightPerBag
      const widthM = sizeWidth * 0.0254
      const heightM = sizeHeight * 0.0254
      const areaSqm = widthM * heightM
      
      // Check if entry exists
      const existing = await db.costingTable.findFirst({
        where: {
          sizeWidth,
          sizeHeight,
          gsm
        }
      })
      
      if (existing) {
        // Update existing
        const updated = await db.costingTable.update({
          where: { id: existing.id },
          data: {
            weightPerBag,
            bagsPerKg,
            areaSqm,
            materialType: entry.materialType || existing.materialType,
            costPerBag: entry.costPerBag ? parseFloat(entry.costPerBag) : existing.costPerBag,
            sellingPrice: entry.sellingPrice ? parseFloat(entry.sellingPrice) : existing.sellingPrice,
          }
        })
        results.push(updated)
      } else {
        // Create new
        const created = await db.costingTable.create({
          data: {
            id: nanoid(),
            sizeWidth,
            sizeHeight,
            gsm,
            weightPerBag,
            bagsPerKg,
            areaSqm,
            materialType: entry.materialType || null,
            costPerBag: entry.costPerBag ? parseFloat(entry.costPerBag) : null,
            sellingPrice: entry.sellingPrice ? parseFloat(entry.sellingPrice) : null,
          }
        })
        results.push(created)
      }
    }
    
    return NextResponse.json({ success: true, count: results.length, results })
  } catch (error) {
    console.error('Error bulk importing costing table:', error)
    return NextResponse.json({ error: 'Failed to bulk import costing table' }, { status: 500 })
  }
}
