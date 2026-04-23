import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single costing table entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const entry = await db.costingTable.findUnique({
      where: { id }
    })
    
    if (!entry) {
      return NextResponse.json({ error: 'Costing table entry not found' }, { status: 404 })
    }
    
    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching costing table entry:', error)
    return NextResponse.json({ error: 'Failed to fetch costing table entry' }, { status: 500 })
  }
}

// PUT update costing table entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Calculate derived values
    const sizeWidth = parseFloat(data.sizeWidth)
    const sizeHeight = parseFloat(data.sizeHeight)
    const gsm = parseFloat(data.gsm)
    const weightPerBag = parseFloat(data.weightPerBag)
    
    // Area in square meters
    const widthM = sizeWidth * 0.0254
    const heightM = sizeHeight * 0.0254
    const areaSqm = widthM * heightM
    
    // Bags per KG
    const bagsPerKg = 1000 / weightPerBag
    
    const entry = await db.costingTable.update({
      where: { id },
      data: {
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
    console.error('Error updating costing table entry:', error)
    return NextResponse.json({ error: 'Failed to update costing table entry' }, { status: 500 })
  }
}

// DELETE costing table entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Soft delete by setting isActive to false
    await db.costingTable.update({
      where: { id },
      data: { isActive: false }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting costing table entry:', error)
    return NextResponse.json({ error: 'Failed to delete costing table entry' }, { status: 500 })
  }
}
