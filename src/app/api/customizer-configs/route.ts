import { NextResponse } from 'next/server'

// Default configuration - always return these
const defaultConfig = [
  { id: '1', step: 'style', isEnabled: true, isRequired: true, sortOrder: 0 },
  { id: '2', step: 'color', isEnabled: true, isRequired: true, sortOrder: 1 },
  { id: '3', step: 'material', isEnabled: true, isRequired: true, sortOrder: 2 },
  { id: '4', step: 'size', isEnabled: true, isRequired: true, sortOrder: 3 },
  { id: '5', step: 'handle', isEnabled: true, isRequired: false, sortOrder: 4 },
  { id: '6', step: 'print', isEnabled: true, isRequired: false, sortOrder: 5 },
]

export async function GET() {
  return NextResponse.json(defaultConfig)
}
