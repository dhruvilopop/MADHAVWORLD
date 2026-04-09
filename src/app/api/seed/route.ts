import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Create admin user if not exists
    const existingAdmin = await db.admin.findUnique({ where: { username: 'madhavbag' } })
    if (!existingAdmin) {
      await db.admin.create({
        data: {
          username: 'madhavbag',
          password: '1122334455'
        }
      })
    }
    
    // Check if already seeded
    const existingProducts = await db.product.count()
    if (existingProducts > 0) {
      return NextResponse.json({ message: 'Database already seeded', adminCreated: true })
    }
    
    // Create categories
    const categories = await Promise.all([
      db.category.create({
        data: {
          name: 'Handbags',
          slug: 'handbags',
          description: 'Elegant handbags for every occasion'
        }
      }),
      db.category.create({
        data: {
          name: 'Shoulder Bags',
          slug: 'shoulder-bags',
          description: 'Comfortable and stylish shoulder bags'
        }
      }),
      db.category.create({
        data: {
          name: 'Tote Bags',
          slug: 'tote-bags',
          description: 'Spacious tote bags for daily use'
        }
      }),
      db.category.create({
        data: {
          name: 'Clutches',
          slug: 'clutches',
          description: 'Elegant clutches for special occasions'
        }
      }),
      db.category.create({
        data: {
          name: 'Backpacks',
          slug: 'backpacks',
          description: 'Stylish backpacks for modern lifestyle'
        }
      })
    ])
    
    // Create sample products
    const products = [
      {
        name: 'Classic Leather Handbag',
        slug: 'classic-leather-handbag',
        description: 'A timeless classic leather handbag crafted with premium materials. Perfect for both casual and formal occasions. Features multiple compartments for organized storage.',
        price: 2999,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
        material: 'Genuine Leather',
        dimensions: '25 x 18 x 10 cm',
        color: 'Brown',
        categoryId: categories[0].id,
        isFeatured: true,
        features: JSON.stringify(['Premium leather', 'Multiple compartments', 'Adjustable strap', 'Metal hardware'])
      },
      {
        name: 'Elegant Evening Clutch',
        slug: 'elegant-evening-clutch',
        description: 'A stunning evening clutch designed for special occasions. Features elegant embellishments and a secure closure.',
        price: 1499,
        image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
        material: 'Synthetic Leather',
        dimensions: '20 x 12 x 5 cm',
        color: 'Black',
        categoryId: categories[3].id,
        isFeatured: true,
        features: JSON.stringify(['Elegant design', 'Chain strap', 'Magnetic closure', 'Interior pocket'])
      },
      {
        name: 'Casual Tote Bag',
        slug: 'casual-tote-bag',
        description: 'A spacious tote bag perfect for daily use. Made from durable canvas material with reinforced handles.',
        price: 1999,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
        material: 'Canvas',
        dimensions: '35 x 40 x 15 cm',
        color: 'Natural',
        categoryId: categories[2].id,
        isFeatured: true,
        features: JSON.stringify(['Spacious interior', 'Reinforced handles', 'Inner zip pocket', 'Lightweight'])
      },
      {
        name: 'Designer Shoulder Bag',
        slug: 'designer-shoulder-bag',
        description: 'A stylish shoulder bag with modern design elements. Perfect for the fashion-forward individual.',
        price: 3499,
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
        material: 'Premium Leather',
        dimensions: '28 x 22 x 12 cm',
        color: 'Tan',
        categoryId: categories[1].id,
        isFeatured: true,
        features: JSON.stringify(['Adjustable strap', 'Multiple pockets', 'Premium finish', 'Durable hardware'])
      },
      {
        name: 'Urban Backpack',
        slug: 'urban-backpack',
        description: 'A modern urban backpack designed for everyday adventures. Features laptop compartment and water-resistant material.',
        price: 2499,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        material: 'Nylon',
        dimensions: '45 x 30 x 15 cm',
        color: 'Grey',
        categoryId: categories[4].id,
        isFeatured: true,
        features: JSON.stringify(['Laptop compartment', 'Water-resistant', 'Padded straps', 'Multiple pockets'])
      },
      {
        name: 'Mini Crossbody Bag',
        slug: 'mini-crossbody-bag',
        description: 'A compact crossbody bag perfect for essentials. Stylish and practical for everyday wear.',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
        material: 'Faux Leather',
        dimensions: '18 x 14 x 6 cm',
        color: 'Black',
        categoryId: categories[1].id,
        isFeatured: false,
        features: JSON.stringify(['Compact design', 'Adjustable strap', 'Zip closure', 'Card slots'])
      },
      {
        name: 'Executive Briefcase',
        slug: 'executive-briefcase',
        description: 'A professional briefcase for the modern executive. Crafted from premium leather with organized compartments.',
        price: 4999,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        material: 'Full Grain Leather',
        dimensions: '40 x 30 x 8 cm',
        color: 'Brown',
        categoryId: categories[0].id,
        isFeatured: false,
        features: JSON.stringify(['Laptop sleeve', 'Document compartments', 'Removable strap', 'Premium finish'])
      },
      {
        name: 'Boho Fringe Bag',
        slug: 'boho-fringe-bag',
        description: 'A trendy bohemian-style bag with fringe details. Perfect for casual outings and festivals.',
        price: 1799,
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
        material: 'Suede',
        dimensions: '22 x 18 x 8 cm',
        color: 'Beige',
        categoryId: categories[1].id,
        isFeatured: false,
        features: JSON.stringify(['Fringe details', 'Boho style', 'Magnetic closure', 'Interior pocket'])
      }
    ]
    
    for (const product of products) {
      await db.product.create({ data: product })
    }
    
    // Create gallery images
    const galleryImages = [
      {
        title: 'Manufacturing Unit',
        description: 'State-of-the-art manufacturing facility',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
        category: 'factory'
      },
      {
        title: 'Craftsmanship',
        description: 'Skilled artisans at work',
        image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800',
        category: 'process'
      },
      {
        title: 'Quality Check',
        description: 'Rigorous quality control process',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
        category: 'process'
      },
      {
        title: 'Our Team',
        description: 'Dedicated team of professionals',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        category: 'team'
      },
      {
        title: 'Raw Materials',
        description: 'Premium quality materials',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        category: 'process'
      },
      {
        title: 'Finished Products',
        description: 'Ready for delivery products',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        category: 'product'
      }
    ]
    
    for (const img of galleryImages) {
      await db.galleryImage.create({ data: img })
    }
    
    // Create or update site settings with default address
    const existingSettings = await db.siteSetting.findFirst()
    if (!existingSettings) {
      await db.siteSetting.create({
        data: {
          companyName: 'Madhav World Bags Industry',
          description: 'Premium quality bags crafted with excellence since 1995',
          address: 'Shop Floor No 26, Shed No 26 Plot No 27, Serve No 189 Paiki 1,2,3, Ttha Serve No 188 Paiki 2 Vishvkarma Industrial Estate Society, Vartej, Bhavnagar-364060, Gujarat, India',
          phone: '+91 98765 43210',
          email: 'info@madhavworldbags.com',
        }
      })
    } else {
      // Update existing settings if address/phone/email are missing
      await db.siteSetting.update({
        where: { id: existingSettings.id },
        data: {
          address: existingSettings.address || 'Shop Floor No 26, Shed No 26 Plot No 27, Serve No 189 Paiki 1,2,3, Ttha Serve No 188 Paiki 2 Vishvkarma Industrial Estate Society, Vartej, Bhavnagar-364060, Gujarat, India',
          phone: existingSettings.phone || '+91 98765 43210',
          email: existingSettings.email || 'info@madhavworldbags.com',
        }
      })
    }

    // Create about content
    await db.aboutContent.create({
      data: {
        section: 'hero',
        title: 'Crafting Excellence Since 1995',
        content: 'Madhav World Bags Industry has been a pioneer in manufacturing premium quality bags for over two decades. Our commitment to quality, innovation, and customer satisfaction has made us a trusted name in the industry.',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
      }
    })
    
    await db.aboutContent.create({
      data: {
        section: 'story',
        title: 'Our Story',
        content: 'Founded in 1995, Madhav World Bags Industry started as a small workshop with a vision to create beautiful, high-quality bags. Today, we have grown into a state-of-the-art manufacturing facility, but our core values remain the same - quality, craftsmanship, and customer satisfaction.',
        image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800'
      }
    })
    
    await db.aboutContent.create({
      data: {
        section: 'values',
        title: 'Our Values',
        content: JSON.stringify([
          { title: 'Quality First', description: 'We never compromise on the quality of our products' },
          { title: 'Innovation', description: 'Constantly evolving with new designs and techniques' },
          { title: 'Customer Satisfaction', description: 'Our customers are at the heart of everything we do' },
          { title: 'Sustainability', description: 'Committed to eco-friendly manufacturing practices' }
        ])
      }
    })
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      categories: categories.length,
      products: products.length,
      gallery: galleryImages.length
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
