import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// Helper to convert number to words
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

  if (num === 0) return 'Zero'

  const convertLakhs = (n: number): string => {
    if (n >= 100000) {
      const lakhs = Math.floor(n / 100000)
      const remainder = n % 100000
      return (lakhs < 100 ? convertThousands(lakhs) : convertLakhs(lakhs)) + ' Lakh' + (remainder > 0 ? ' ' + convertThousands(remainder) : '')
    }
    return convertThousands(n)
  }

  const convertThousands = (n: number): string => {
    if (n >= 1000) {
      const thousands = Math.floor(n / 1000)
      const remainder = n % 1000
      return (thousands < 100 ? convertHundreds(thousands) : convertThousands(thousands)) + ' Thousand' + (remainder > 0 ? ' ' + convertHundreds(remainder) : '')
    }
    return convertHundreds(n)
  }

  const convertHundreds = (n: number): string => {
    if (n >= 100) {
      const hundreds = Math.floor(n / 100)
      const remainder = n % 100
      return ones[hundreds] + ' Hundred' + (remainder > 0 ? ' ' + convertTens(remainder) : '')
    }
    return convertTens(n)
  }

  const convertTens = (n: number): string => {
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    const ten = Math.floor(n / 10)
    const unit = n % 10
    return tens[ten] + (unit > 0 ? ' ' + ones[unit] : '')
  }

  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)

  let result = convertLakhs(intPart) + ' Rupees'
  if (decPart > 0) {
    result += ' and ' + convertTens(decPart) + ' Paise'
  }

  return result
}

// GET - Fetch invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')

    if (id) {
      const invoice = await db.invoice.findUnique({
        where: { id },
        include: {
          InvoiceItem: true,
          Customer: true,
          Order: true
        }
      })
      return NextResponse.json(invoice)
    }

    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }

    const invoices = await db.invoice.findMany({
      where,
      include: {
        InvoiceItem: true,
        Customer: {
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// POST - Create invoice
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Generate invoice number
    const count = await db.invoice.count()
    const invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`

    // Calculate amounts
    let subtotal = 0
    let totalCgst = 0
    let totalSgst = 0
    let totalIgst = 0

    const items = data.items.map((item: {
      productName: string
      description?: string
      hsnCode?: string
      quantity: number
      unit?: string
      rate: number
      discount?: number
      cgstRate?: number
      sgstRate?: number
      igstRate?: number
      productId?: string
    }) => {
      const qty = item.quantity || 1
      const rate = item.rate || 0
      const disc = item.discount || 0
      const taxableValue = qty * rate - disc
      const cgstAmt = taxableValue * (item.cgstRate || 0) / 100
      const sgstAmt = taxableValue * (item.sgstRate || 0) / 100
      const igstAmt = taxableValue * (item.igstRate || 0) / 100
      const total = taxableValue + cgstAmt + sgstAmt + igstAmt

      subtotal += taxableValue
      totalCgst += cgstAmt
      totalSgst += sgstAmt
      totalIgst += igstAmt

      return {
        id: randomUUID(),
        productName: item.productName,
        description: item.description || null,
        hsnCode: item.hsnCode || null,
        quantity: qty,
        unit: item.unit || 'PCS',
        rate,
        discount: disc,
        taxableValue,
        cgstRate: item.cgstRate || 0,
        sgstRate: item.sgstRate || 0,
        igstRate: item.igstRate || 0,
        cgstAmount: cgstAmt,
        sgstAmount: sgstAmt,
        igstAmount: igstAmt,
        total,
        productId: item.productId || null
      }
    })

    const discount = data.discount || 0
    const roundOff = data.roundOff || 0
    const total = subtotal - discount + totalCgst + totalSgst + totalIgst + roundOff

    const invoice = await db.invoice.create({
      data: {
        id: randomUUID(),
        invoiceNumber,
        orderId: data.orderId || null,
        customerId: data.customerId || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress || null,
        customerGstin: data.customerGstin || null,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyPhone: data.companyPhone,
        companyEmail: data.companyEmail || null,
        companyGstin: data.companyGstin || null,
        companyLogo: data.companyLogo || null,
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        placeOfSupply: data.placeOfSupply || null,
        subtotal,
        discount,
        cgstRate: data.cgstRate || 0,
        sgstRate: data.sgstRate || 0,
        igstRate: data.igstRate || 0,
        cgstAmount: totalCgst,
        sgstAmount: totalSgst,
        igstAmount: totalIgst,
        totalTax: totalCgst + totalSgst + totalIgst,
        roundOff,
        total,
        amountInWords: numberToWords(Math.round(total)),
        bankName: data.bankName || null,
        bankAccount: data.bankAccount || null,
        bankIfsc: data.bankIfsc || null,
        bankBranch: data.bankBranch || null,
        notes: data.notes || null,
        terms: data.terms || null,
        signature: data.signature || null,
        status: data.status || 'draft',
        updatedAt: new Date(),
        InvoiceItem: {
          create: items
        }
      },
      include: {
        InvoiceItem: true
      }
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

// PUT - Update invoice
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, items, ...updateData } = data

    // Calculate amounts if items provided
    if (items && Array.isArray(items)) {
      let subtotal = 0
      let totalCgst = 0
      let totalSgst = 0
      let totalIgst = 0

      const newItems = items.map((item: {
        productName: string
        description?: string
        hsnCode?: string
        quantity: number
        unit?: string
        rate: number
        discount?: number
        cgstRate?: number
        sgstRate?: number
        igstRate?: number
        productId?: string
      }) => {
        const qty = item.quantity || 1
        const rate = item.rate || 0
        const disc = item.discount || 0
        const taxableValue = qty * rate - disc
        const cgstAmt = taxableValue * (item.cgstRate || 0) / 100
        const sgstAmt = taxableValue * (item.sgstRate || 0) / 100
        const igstAmt = taxableValue * (item.igstRate || 0) / 100
        const total = taxableValue + cgstAmt + sgstAmt + igstAmt

        subtotal += taxableValue
        totalCgst += cgstAmt
        totalSgst += sgstAmt
        totalIgst += igstAmt

        return {
          id: randomUUID(),
          invoiceId: id,
          productName: item.productName,
          description: item.description || null,
          hsnCode: item.hsnCode || null,
          quantity: qty,
          unit: item.unit || 'PCS',
          rate,
          discount: disc,
          taxableValue,
          cgstRate: item.cgstRate || 0,
          sgstRate: item.sgstRate || 0,
          igstRate: item.igstRate || 0,
          cgstAmount: cgstAmt,
          sgstAmount: sgstAmt,
          igstAmount: igstAmt,
          total,
          productId: item.productId || null
        }
      })

      const discount = updateData.discount || 0
      const roundOff = updateData.roundOff || 0
      const total = subtotal - discount + totalCgst + totalSgst + totalIgst + roundOff

      // Delete existing items and create new ones
      await db.invoiceItem.deleteMany({ where: { invoiceId: id } })
      await db.invoiceItem.createMany({ data: newItems })

      updateData.subtotal = subtotal
      updateData.cgstAmount = totalCgst
      updateData.sgstAmount = totalSgst
      updateData.igstAmount = totalIgst
      updateData.totalTax = totalCgst + totalSgst + totalIgst
      updateData.total = total
      updateData.amountInWords = numberToWords(Math.round(total))
    }

    if (updateData.invoiceDate) {
      updateData.invoiceDate = new Date(updateData.invoiceDate)
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate)
    }

    updateData.updatedAt = new Date()

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
      include: {
        InvoiceItem: true
      }
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

// DELETE - Delete invoice
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    await db.invoiceItem.deleteMany({ where: { invoiceId: id } })
    await db.invoice.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
