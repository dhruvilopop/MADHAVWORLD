// Script to seed costing table with data from the user's image
// Run with: bun run scripts/seed-costing.ts

import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

// Data from the costing table image
const costingData = [
  // GSM 60
  { sizeWidth: 8, sizeHeight: 10, gsm: 60, weightPerBag: 8, bagsPerKg: 125 },
  { sizeWidth: 9, sizeHeight: 12, gsm: 60, weightPerBag: 10, bagsPerKg: 100 },
  { sizeWidth: 10, sizeHeight: 14, gsm: 60, weightPerBag: 13, bagsPerKg: 76.92 },
  { sizeWidth: 12, sizeHeight: 16, gsm: 60, weightPerBag: 17, bagsPerKg: 58.82 },
  { sizeWidth: 14, sizeHeight: 19, gsm: 60, weightPerBag: 23, bagsPerKg: 43.48 },
  { sizeWidth: 16, sizeHeight: 21, gsm: 60, weightPerBag: 29, bagsPerKg: 34.48 },
  
  // GSM 80
  { sizeWidth: 8, sizeHeight: 10, gsm: 80, weightPerBag: 15, bagsPerKg: 66.67 },
  { sizeWidth: 9, sizeHeight: 12, gsm: 80, weightPerBag: 21, bagsPerKg: 47.62 },
  { sizeWidth: 10, sizeHeight: 14, gsm: 80, weightPerBag: 29, bagsPerKg: 34.48 },
  { sizeWidth: 12, sizeHeight: 16, gsm: 80, weightPerBag: 42, bagsPerKg: 23.81 },
]

async function main() {
  console.log('Seeding costing table...')
  
  for (const entry of costingData) {
    // Calculate area in square meters
    const widthM = entry.sizeWidth * 0.0254
    const heightM = entry.sizeHeight * 0.0254
    const areaSqm = widthM * heightM
    
    // Check if entry already exists
    const existing = await prisma.costingTable.findFirst({
      where: {
        sizeWidth: entry.sizeWidth,
        sizeHeight: entry.sizeHeight,
        gsm: entry.gsm
      }
    })
    
    if (existing) {
      console.log(`Updating existing entry: ${entry.sizeWidth}x${entry.sizeHeight} @ ${entry.gsm} GSM`)
      await prisma.costingTable.update({
        where: { id: existing.id },
        data: {
          weightPerBag: entry.weightPerBag,
          bagsPerKg: entry.bagsPerKg,
          areaSqm
        }
      })
    } else {
      console.log(`Creating new entry: ${entry.sizeWidth}x${entry.sizeHeight} @ ${entry.gsm} GSM`)
      await prisma.costingTable.create({
        data: {
          id: nanoid(),
          sizeWidth: entry.sizeWidth,
          sizeHeight: entry.sizeHeight,
          gsm: entry.gsm,
          weightPerBag: entry.weightPerBag,
          bagsPerKg: entry.bagsPerKg,
          areaSqm,
          isActive: true
        }
      })
    }
  }
  
  console.log('Seeding completed!')
  
  // Display all entries
  const all = await prisma.costingTable.findMany({
    orderBy: [{ gsm: 'asc' }, { sizeWidth: 'asc' }]
  })
  
  console.log('\nCurrent entries:')
  console.log('GSM | Size | Weight/Bag | Bags/KG')
  console.log('-'.repeat(40))
  for (const e of all) {
    console.log(`${e.gsm} | ${e.sizeWidth}x${e.sizeHeight} | ${e.weightPerBag}gm | ${e.bagsPerKg.toFixed(2)}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
