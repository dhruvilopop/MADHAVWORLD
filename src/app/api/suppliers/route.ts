import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

// GET all suppliers
export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
  }
}

// POST create new supplier
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const supplier = await db.supplier.create({
      data: {
        id: nanoid(),
        name: data.name,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone,
        address: data.address || null,
        gstin: data.gstin || null,
        panNumber: data.panNumber || null,
        bankName: data.bankName || null,
        accountNumber: data.accountNumber || null,
        ifscCode: data.ifscCode || null,
        creditDays: data.creditDays ? parseInt(data.creditDays) : null,
        creditLimit: data.creditLimit ? parseFloat(data.creditLimit) : null,
        isActive: data.isActive ?? true,
        rating: data.rating ? parseInt(data.rating) : null,
        notes: data.notes || null,
      }
    })
    
    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
  }
}
