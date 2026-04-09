import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch all blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    
    const where: Record<string, unknown> = {}
    if (published === 'true') {
      where.isPublished = true
    }

    const posts = await db.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const post = await db.blogPost.create({
      data: {
        id: randomUUID(),
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || null,
        image: data.image || null,
        author: data.author || null,
        category: data.category || null,
        tags: data.tags || null,
        isPublished: data.isPublished || false,
        isFeatured: data.isFeatured || false,
        publishedAt: data.isPublished ? new Date() : null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
  }
}

// PUT - Update blog post
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    if (updateData.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    if (updateData.isPublished && !updateData.publishedAt) {
      updateData.publishedAt = new Date()
    }

    const post = await db.blogPost.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Blog post ID is required' }, { status: 400 })
    }

    await db.blogPost.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
  }
}
