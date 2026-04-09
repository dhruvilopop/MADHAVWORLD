import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET site settings
export async function GET() {
  try {
    let settings = await db.siteSetting.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await db.siteSetting.create({
        data: {
          id: 'default',
          companyName: 'Madhav World Bags Industry',
          address: 'Industrial Area, Bag Manufacturing Hub, India',
          phone: '+91 98765 43210',
          email: 'info@madhavworldbags.com',
          description: 'Premium quality bags manufacturer',
          updatedAt: new Date(),
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({
      id: 'default',
      companyName: 'Madhav World Bags Industry',
      address: 'Industrial Area, Bag Manufacturing Hub, India',
      phone: '+91 98765 43210',
      email: 'info@madhavworldbags.com',
      description: 'Premium quality bags manufacturer',
      companyLogo: null,
    })
  }
}

// PUT update site settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    const settings = await db.siteSetting.upsert({
      where: { id: 'default' },
      update: {
        companyName: data.companyName,
        address: data.address,
        phone: data.phone,
        email: data.email,
        description: data.description,
        companyLogo: data.companyLogo,
        updatedAt: new Date(),
      },
      create: {
        id: 'default',
        companyName: data.companyName,
        address: data.address,
        phone: data.phone,
        email: data.email,
        description: data.description,
        companyLogo: data.companyLogo,
      }
    })
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
