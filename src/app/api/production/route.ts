import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

// GET all production entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (startDate || endDate) {
      where.productionDate = {}
      if (startDate) {
        where.productionDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.productionDate.lte = new Date(endDate)
      }
    }
    
    const productions = await db.productionEntry.findMany({
      where,
      include: {
        rawMaterials: {
          include: {
            rawMaterial: true
          }
        },
        qualityChecks: true
      },
      orderBy: { productionDate: 'desc' }
    })
    
    return NextResponse.json(productions)
  } catch (error) {
    console.error('Error fetching productions:', error)
    return NextResponse.json({ error: 'Failed to fetch productions' }, { status: 500 })
  }
}

// POST create new production entry
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const productionNumber = `PROD-${Date.now().toString(36).toUpperCase()}`
    
    // Calculate costs
    let materialCost = 0
    const rawMaterialsData = []
    
    for (const item of data.rawMaterials || []) {
      const material = await db.rawMaterial.findUnique({
        where: { id: item.rawMaterialId }
      })
      
      if (material) {
        const itemCost = item.quantityUsed * material.unitCost
        materialCost += itemCost
        
        rawMaterialsData.push({
          id: nanoid(),
          rawMaterialId: item.rawMaterialId,
          materialName: material.name,
          quantityPlanned: parseFloat(item.quantityPlanned) || 0,
          quantityUsed: parseFloat(item.quantityUsed) || 0,
          quantityWasted: parseFloat(item.quantityWasted) || 0,
          unitCost: material.unitCost,
          totalCost: itemCost,
          notes: item.notes || null,
        })
        
        // Deduct from raw material stock
        const previousStock = material.currentStock
        const newStock = Math.max(0, previousStock - parseFloat(item.quantityUsed || 0))
        
        await db.rawMaterial.update({
          where: { id: item.rawMaterialId },
          data: { currentStock: newStock }
        })
        
        // Create stock movement
        await db.rawMaterialStockMovement.create({
          data: {
            id: nanoid(),
            rawMaterialId: item.rawMaterialId,
            type: 'PRODUCTION',
            quantity: parseFloat(item.quantityUsed) || 0,
            previousStock,
            newStock,
            reason: `Production: ${productionNumber}`,
            reference: productionNumber,
            unitCost: material.unitCost,
            totalCost: itemCost,
          }
        })
      }
    }
    
    const laborCost = parseFloat(data.laborCost) || 0
    const overheadCost = parseFloat(data.overheadCost) || 0
    const totalCost = materialCost + laborCost + overheadCost
    const quantityProduced = parseInt(data.quantityProduced) || 0
    const costPerPiece = quantityProduced > 0 ? totalCost / quantityProduced : 0
    
    const production = await db.productionEntry.create({
      data: {
        id: nanoid(),
        productionNumber,
        productionDate: data.productionDate ? new Date(data.productionDate) : new Date(),
        startTime: data.startTime ? new Date(data.startTime) : null,
        endTime: data.endTime ? new Date(data.endTime) : null,
        productName: data.productName,
        productId: data.productId || null,
        size: data.size ? parseFloat(data.size) : null,
        width: data.width ? parseFloat(data.width) : null,
        height: data.height ? parseFloat(data.height) : null,
        gsm: data.gsm ? parseFloat(data.gsm) : null,
        bagsPerKg: data.bagsPerKg ? parseFloat(data.bagsPerKg) : null,
        color: data.color || null,
        design: data.design || null,
        quantityProduced,
        quantityRejected: parseInt(data.quantityRejected) || 0,
        quantityPassed: quantityProduced - (parseInt(data.quantityRejected) || 0),
        materialCost,
        laborCost,
        overheadCost,
        totalCost,
        costPerPiece,
        workerId: data.workerId || null,
        workerName: data.workerName || null,
        machineId: data.machineId || null,
        machineName: data.machineName || null,
        batchNumber: data.batchNumber || null,
        shift: data.shift || null,
        qualityStatus: data.qualityStatus || 'pending',
        qualityNotes: data.qualityNotes || null,
        inspectedBy: data.inspectedBy || null,
        inspectedAt: data.inspectedAt ? new Date(data.inspectedAt) : null,
        wasteQuantity: parseFloat(data.wasteQuantity) || 0,
        wasteReason: data.wasteReason || null,
        status: data.status || 'planned',
        completionPercent: parseInt(data.completionPercent) || 0,
        notes: data.notes || null,
        images: data.images || null,
        createdBy: data.createdBy || null,
        rawMaterials: {
          create: rawMaterialsData
        }
      },
      include: {
        rawMaterials: {
          include: {
            rawMaterial: true
          }
        }
      }
    })
    
    return NextResponse.json(production)
  } catch (error) {
    console.error('Error creating production:', error)
    return NextResponse.json({ error: 'Failed to create production' }, { status: 500 })
  }
}
