import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// Default options to seed
const defaultOptions = [
  // Styles
  { category: 'style', name: 'Tote Bag', value: 'tote', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', sortOrder: 1 },
  { category: 'style', name: 'Shoulder Bag', value: 'shoulder', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', sortOrder: 2 },
  { category: 'style', name: 'Handbag', value: 'handbag', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400', sortOrder: 3 },
  { category: 'style', name: 'Backpack', value: 'backpack', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', sortOrder: 4 },
  { category: 'style', name: 'Crossbody', value: 'crossbody', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400', sortOrder: 5 },
  
  // Colors
  { category: 'color', name: 'Classic Black', value: '#1a1a1a', sortOrder: 1 },
  { category: 'color', name: 'Rich Brown', value: '#8B4513', sortOrder: 2 },
  { category: 'color', name: 'Tan', value: '#D2B48C', sortOrder: 3 },
  { category: 'color', name: 'Navy Blue', value: '#1e3a5f', sortOrder: 4 },
  { category: 'color', name: 'Bold Red', value: '#DC143C', sortOrder: 5 },
  { category: 'color', name: 'Forest Green', value: '#228B22', sortOrder: 6 },
  { category: 'color', name: 'Beige', value: '#F5F5DC', sortOrder: 7 },
  { category: 'color', name: 'Maroon', value: '#800000', sortOrder: 8 },
  { category: 'color', name: 'Grey', value: '#708090', sortOrder: 9 },
  
  // Materials
  { category: 'material', name: 'Genuine Leather', value: 'leather', sortOrder: 1 },
  { category: 'material', name: 'Vegan Leather', value: 'vegan', sortOrder: 2 },
  { category: 'material', name: 'Canvas', value: 'canvas', sortOrder: 3 },
  { category: 'material', name: 'Nylon', value: 'nylon', sortOrder: 4 },
  
  // Sizes
  { category: 'size', name: 'Small', value: '20×15×8 cm', sortOrder: 1 },
  { category: 'size', name: 'Medium', value: '30×22×12 cm', sortOrder: 2 },
  { category: 'size', name: 'Large', value: '40×30×15 cm', sortOrder: 3 },
  { category: 'size', name: 'Extra Large', value: '50×35×20 cm', sortOrder: 4 },
  
  // Handle Types
  { category: 'handle', name: 'Double Handle', value: 'double', sortOrder: 1 },
  { category: 'handle', name: 'Single Handle', value: 'single', sortOrder: 2 },
  { category: 'handle', name: 'Crossbody Strap', value: 'crossbody', sortOrder: 3 },
  { category: 'handle', name: 'No Handle', value: 'none', sortOrder: 4 },
  
  // Print Options
  { category: 'print', name: 'No Print', value: 'none', sortOrder: 1 },
  { category: 'print', name: 'Logo Print', value: 'logo', sortOrder: 2 },
  { category: 'print', name: 'Pattern', value: 'pattern', sortOrder: 3 },
]

// POST - Seed default options and configs
export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
    if (type === 'options') {
      const existing = await db.customizerOption.findFirst()
      if (existing) {
        return NextResponse.json({ message: 'Options already seeded', count: 0 })
      }
      
      let count = 0
      for (const option of defaultOptions) {
        await db.customizerOption.create({
          data: {
            id: randomUUID(),
            category: option.category,
            name: option.name,
            value: option.value,
            image: 'image' in option ? option.image : null,
            isActive: true,
            sortOrder: option.sortOrder,
            updatedAt: new Date(),
          }
        })
        count++
      }
      
      return NextResponse.json({ message: 'Options seeded successfully', count })
    }
    
    if (type === 'configs') {
      const existing = await db.customizerConfig.findFirst()
      if (existing) {
        return NextResponse.json({ message: 'Configs already seeded', count: 0 })
      }
      
      const defaultConfigs = [
        { step: 'style', isEnabled: true, isRequired: true, sortOrder: 1 },
        { step: 'color', isEnabled: true, isRequired: true, sortOrder: 2 },
        { step: 'material', isEnabled: true, isRequired: true, sortOrder: 3 },
        { step: 'size', isEnabled: true, isRequired: true, sortOrder: 4 },
        { step: 'handle', isEnabled: true, isRequired: false, sortOrder: 5 },
        { step: 'print', isEnabled: true, isRequired: false, sortOrder: 6 },
      ]
      
      let count = 0
      for (const config of defaultConfigs) {
        await db.customizerConfig.create({
          data: {
            id: randomUUID(),
            step: config.step,
            isEnabled: config.isEnabled,
            isRequired: config.isRequired,
            sortOrder: config.sortOrder,
            updatedAt: new Date(),
          }
        })
        count++
      }
      
      return NextResponse.json({ message: 'Configs seeded successfully', count })
    }
    
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error seeding:', error)
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 })
  }
}

// GET - Check if seeded and auto-seed
export async function GET() {
  try {
    let optionsCount = 0
    let configsCount = 0
    
    try {
      optionsCount = await db.customizerOption.count()
    } catch {
      // Table might not exist yet
    }
    
    try {
      configsCount = await db.customizerConfig.count()
    } catch {
      // Table might not exist yet
    }
    
    // Auto-seed options if empty
    if (optionsCount === 0) {
      for (const option of defaultOptions) {
        try {
          await db.customizerOption.create({
            data: {
              id: randomUUID(),
              category: option.category,
              name: option.name,
              value: option.value,
              image: 'image' in option ? option.image : null,
              isActive: true,
              sortOrder: option.sortOrder,
              updatedAt: new Date(),
            }
          })
          optionsCount++
        } catch {
          // Skip if already exists
        }
      }
    }
    
    // Auto-seed configs if empty
    if (configsCount === 0) {
      const defaultConfigs = [
        { step: 'style', isEnabled: true, isRequired: true, sortOrder: 1 },
        { step: 'color', isEnabled: true, isRequired: true, sortOrder: 2 },
        { step: 'material', isEnabled: true, isRequired: true, sortOrder: 3 },
        { step: 'size', isEnabled: true, isRequired: true, sortOrder: 4 },
        { step: 'handle', isEnabled: true, isRequired: false, sortOrder: 5 },
        { step: 'print', isEnabled: true, isRequired: false, sortOrder: 6 },
      ]
      
      for (const config of defaultConfigs) {
        try {
          await db.customizerConfig.create({
            data: {
              id: randomUUID(),
              step: config.step,
              isEnabled: config.isEnabled,
              isRequired: config.isRequired,
              sortOrder: config.sortOrder,
              updatedAt: new Date(),
            }
          })
          configsCount++
        } catch {
          // Skip if already exists
        }
      }
    }
    
    return NextResponse.json({
      optionsCount,
      configsCount,
      isSeeded: optionsCount > 0 && configsCount > 0
    })
  } catch (error) {
    console.error('Error checking seed status:', error)
    return NextResponse.json({ error: 'Failed to check' }, { status: 500 })
  }
}
