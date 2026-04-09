import { NextRequest, NextResponse } from 'next/server'

// Default options as flat array
const defaultOptionsArray = [
  // Styles
  { id: 's1', category: 'style', name: 'Tote Bag', value: 'tote', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300', isActive: true, sortOrder: 0 },
  { id: 's2', category: 'style', name: 'Shoulder Bag', value: 'shoulder', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300', isActive: true, sortOrder: 1 },
  { id: 's3', category: 'style', name: 'Handbag', value: 'handbag', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=300', isActive: true, sortOrder: 2 },
  { id: 's4', category: 'style', name: 'Backpack', value: 'backpack', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300', isActive: true, sortOrder: 3 },
  { id: 's5', category: 'style', name: 'Crossbody', value: 'crossbody', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=300', isActive: true, sortOrder: 4 },
  // Colors
  { id: 'c1', category: 'color', name: 'Classic Black', value: '#1a1a1a', image: null, isActive: true, sortOrder: 0 },
  { id: 'c2', category: 'color', name: 'Rich Brown', value: '#8B4513', image: null, isActive: true, sortOrder: 1 },
  { id: 'c3', category: 'color', name: 'Tan', value: '#D2B48C', image: null, isActive: true, sortOrder: 2 },
  { id: 'c4', category: 'color', name: 'Navy Blue', value: '#1e3a5f', image: null, isActive: true, sortOrder: 3 },
  { id: 'c5', category: 'color', name: 'Burgundy', value: '#800020', image: null, isActive: true, sortOrder: 4 },
  { id: 'c6', category: 'color', name: 'Forest Green', value: '#228B22', image: null, isActive: true, sortOrder: 5 },
  { id: 'c7', category: 'color', name: 'Natural Beige', value: '#F5F5DC', image: null, isActive: true, sortOrder: 6 },
  { id: 'c8', category: 'color', name: 'Pure White', value: '#FFFFFF', image: null, isActive: true, sortOrder: 7 },
  // Materials
  { id: 'm1', category: 'material', name: 'Genuine Leather', value: 'leather', image: null, isActive: true, sortOrder: 0 },
  { id: 'm2', category: 'material', name: 'Canvas', value: 'canvas', image: null, isActive: true, sortOrder: 1 },
  { id: 'm3', category: 'material', name: 'Jute', value: 'jute', image: null, isActive: true, sortOrder: 2 },
  { id: 'm4', category: 'material', name: 'Nylon', value: 'nylon', image: null, isActive: true, sortOrder: 3 },
  { id: 'm5', category: 'material', name: 'Cotton', value: 'cotton', image: null, isActive: true, sortOrder: 4 },
  { id: 'm6', category: 'material', name: 'Non-Woven', value: 'nonwoven', image: null, isActive: true, sortOrder: 5 },
  // Sizes
  { id: 'sz1', category: 'size', name: 'Small', value: '20×15×8 cm', image: null, isActive: true, sortOrder: 0 },
  { id: 'sz2', category: 'size', name: 'Medium', value: '30×22×12 cm', image: null, isActive: true, sortOrder: 1 },
  { id: 'sz3', category: 'size', name: 'Large', value: '40×30×15 cm', image: null, isActive: true, sortOrder: 2 },
  { id: 'sz4', category: 'size', name: 'X-Large', value: '50×35×20 cm', image: null, isActive: true, sortOrder: 3 },
  // Handles
  { id: 'h1', category: 'handle', name: 'Double Handle', value: 'double', image: null, isActive: true, sortOrder: 0 },
  { id: 'h2', category: 'handle', name: 'Single Handle', value: 'single', image: null, isActive: true, sortOrder: 1 },
  { id: 'h3', category: 'handle', name: 'Crossbody Strap', value: 'crossbody', image: null, isActive: true, sortOrder: 2 },
  { id: 'h4', category: 'handle', name: 'Chain Strap', value: 'chain', image: null, isActive: true, sortOrder: 3 },
  // Prints
  { id: 'p1', category: 'print', name: 'No Print', value: 'none', image: null, isActive: true, sortOrder: 0 },
  { id: 'p2', category: 'print', name: 'Logo Print', value: 'logo', image: null, isActive: true, sortOrder: 1 },
  { id: 'p3', category: 'print', name: 'Pattern Print', value: 'pattern', image: null, isActive: true, sortOrder: 2 },
  { id: 'p4', category: 'print', name: 'Embossed', value: 'emboss', image: null, isActive: true, sortOrder: 3 },
]

const defaultConfig = [
  { id: '1', step: 'style', isEnabled: true, isRequired: true, sortOrder: 0 },
  { id: '2', step: 'color', isEnabled: true, isRequired: true, sortOrder: 1 },
  { id: '3', step: 'material', isEnabled: true, isRequired: true, sortOrder: 2 },
  { id: '4', step: 'size', isEnabled: true, isRequired: true, sortOrder: 3 },
  { id: '5', step: 'handle', isEnabled: true, isRequired: false, sortOrder: 4 },
  { id: '6', step: 'print', isEnabled: true, isRequired: false, sortOrder: 5 },
]

// GET - Fetch customizer options as array
export async function GET(request: NextRequest) {
  return NextResponse.json({ options: defaultOptionsArray, config: defaultConfig })
}
