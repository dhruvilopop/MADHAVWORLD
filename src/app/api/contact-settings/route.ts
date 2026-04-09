import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch contact settings
export async function GET() {
  try {
    let settings = await db.contactSetting.findFirst()

    // Create default if not exists
    if (!settings) {
      settings = await db.contactSetting.create({
        data: {
          id: randomUUID(),
          recipientEmail: 'info@example.com',
          ccEmails: null,
          bccEmails: null,
          emailSubject: 'New Contact Form Submission',
          successMessage: 'Thank you for your message. We will get back to you soon!',
          enableAutoReply: false,
          autoReplyBody: null,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching contact settings:', error)
    return NextResponse.json({ error: 'Failed to fetch contact settings' }, { status: 500 })
  }
}

// PUT - Update contact settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    let settings = await db.contactSetting.findFirst()

    if (settings) {
      settings = await db.contactSetting.update({
        where: { id: settings.id },
        data: {
          recipientEmail: data.recipientEmail,
          ccEmails: data.ccEmails || null,
          bccEmails: data.bccEmails || null,
          emailSubject: data.emailSubject || null,
          successMessage: data.successMessage || null,
          enableAutoReply: data.enableAutoReply ?? false,
          autoReplyBody: data.autoReplyBody || null,
          updatedAt: new Date()
        }
      })
    } else {
      settings = await db.contactSetting.create({
        data: {
          id: randomUUID(),
          recipientEmail: data.recipientEmail,
          ccEmails: data.ccEmails || null,
          bccEmails: data.bccEmails || null,
          emailSubject: data.emailSubject || null,
          successMessage: data.successMessage || null,
          enableAutoReply: data.enableAutoReply ?? false,
          autoReplyBody: data.autoReplyBody || null,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating contact settings:', error)
    return NextResponse.json({ error: 'Failed to update contact settings' }, { status: 500 })
  }
}
