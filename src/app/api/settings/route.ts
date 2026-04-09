import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch site settings
export async function GET() {
  try {
    let settings = await db.siteSetting.findFirst()
    
    if (!settings) {
      settings = await db.siteSetting.create({
        data: {
          id: randomUUID(),
          companyName: 'Madhav World Bags Industry',
          description: 'Premium quality bags crafted with excellence since 1995',
          address: 'Shop Floor No 26, Shed No 26 Plot No 27, Serve No 189 Paiki 1,2,3, Ttha Serve No 188 Paiki 2 Vishvkarma Industrial Estate Society, Vartej, Bhavnagar-364060, Gujarat, India',
          phone: '+91 98765 43210',
          email: 'info@madhavworldbags.com',
          updatedAt: new Date(),
        }
      })
    } else if (!settings.address || !settings.phone || !settings.email) {
      // Update with defaults if any are missing
      settings = await db.siteSetting.update({
        where: { id: settings.id },
        data: {
          address: settings.address || 'Shop Floor No 26, Shed No 26 Plot No 27, Serve No 189 Paiki 1,2,3, Ttha Serve No 188 Paiki 2 Vishvkarma Industrial Estate Society, Vartej, Bhavnagar-364060, Gujarat, India',
          phone: settings.phone || '+91 98765 43210',
          email: settings.email || 'info@madhavworldbags.com',
          updatedAt: new Date(),
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT - Update site settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    let settings = await db.siteSetting.findFirst()
    
    if (!settings) {
      settings = await db.siteSetting.create({
        data: {
          id: randomUUID(),
          companyName: data.companyName || 'Madhav World Bags Industry',
          companyLogo: data.companyLogo || null,
          address: data.address || null,
          phone: data.phone || null,
          email: data.email || null,
          description: data.description || null,
          updatedAt: new Date(),
        }
      })
    } else {
      settings = await db.siteSetting.update({
        where: { id: settings.id },
        data: {
          companyName: data.companyName,
          companyLogo: data.companyLogo || null,
          address: data.address || null,
          phone: data.phone || null,
          email: data.email || null,
          description: data.description || null,
          updatedAt: new Date(),
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
