import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch SEO settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('pageType')
    const pageId = searchParams.get('pageId')

    if (pageType) {
      const seo = await db.sEOSetting.findFirst({
        where: { 
          pageType,
          pageId: pageId || null
        }
      })
      return NextResponse.json(seo)
    }

    const allSeo = await db.sEOSetting.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(allSeo)
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json({ error: 'Failed to fetch SEO settings' }, { status: 500 })
  }
}

// POST - Create or update SEO settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Check if exists
    const existing = await db.sEOSetting.findFirst({
      where: {
        pageType: data.pageType,
        pageId: data.pageId || null
      }
    })

    if (existing) {
      const updated = await db.sEOSetting.update({
        where: { id: existing.id },
        data: {
          metaTitle: data.metaTitle || null,
          metaDesc: data.metaDesc || null,
          metaKeys: data.metaKeys || null,
          ogImage: data.ogImage || null,
          canonical: data.canonical || null,
          updatedAt: new Date()
        }
      })
      return NextResponse.json(updated)
    }

    const seo = await db.sEOSetting.create({
      data: {
        id: randomUUID(),
        pageType: data.pageType,
        pageId: data.pageId || null,
        metaTitle: data.metaTitle || null,
        metaDesc: data.metaDesc || null,
        metaKeys: data.metaKeys || null,
        ogImage: data.ogImage || null,
        canonical: data.canonical || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(seo, { status: 201 })
  } catch (error) {
    console.error('Error saving SEO settings:', error)
    return NextResponse.json({ error: 'Failed to save SEO settings' }, { status: 500 })
  }
}
