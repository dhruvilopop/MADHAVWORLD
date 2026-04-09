from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from io import BytesIO
import os

app = Flask(__name__)
CORS(app)

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Colors
PRIMARY_COLOR = colors.HexColor('#F59E0B')  # Amber
SECONDARY_COLOR = colors.HexColor('#EA580C')  # Orange
TEXT_DARK = colors.HexColor('#1F2937')
TEXT_GRAY = colors.HexColor('#6B7280')
BORDER_COLOR = colors.HexColor('#E5E7EB')

def create_quote_pdf(quote_data, settings_data):
    """Generate a professional quote PDF"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName='Times New Roman',
        fontSize=24,
        textColor=TEXT_DARK,
        alignment=TA_CENTER,
        spaceAfter=12
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=10,
        textColor=TEXT_GRAY,
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontName='Times New Roman',
        fontSize=12,
        textColor=TEXT_GRAY,
        spaceBefore=12,
        spaceAfter=8
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=10,
        textColor=TEXT_DARK,
        leading=14
    )
    
    bold_style = ParagraphStyle(
        'CustomBold',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=10,
        textColor=TEXT_DARK,
        leading=14
    )
    
    story = []
    
    # Company Header
    company_name = settings_data.get('companyName', 'Madhav World Bags Industry')
    company_address = settings_data.get('address', 'Industrial Area, Bag Manufacturing Hub, India')
    company_phone = settings_data.get('phone', '+91 98765 43210')
    company_email = settings_data.get('email', 'info@madhavworldbags.com')
    
    # Header table
    header_data = [
        [
            Paragraph(f'<b>{company_name}</b>', ParagraphStyle('CompanyName', parent=bold_style, fontSize=16, textColor=PRIMARY_COLOR)),
            Paragraph(f'{company_address}<br/>{company_phone}<br/>{company_email}', ParagraphStyle('Right', parent=normal_style, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[350, 200])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    
    # Separator line
    line_table = Table([['']], colWidths=[500])
    line_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 2, PRIMARY_COLOR),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 20))
    
    # Quote title
    story.append(Paragraph('QUOTATION', title_style))
    
    # Quote number badge
    quote_number = quote_data.get('quoteNumber', 'QT-000000')
    badge_style = ParagraphStyle('Badge', parent=normal_style, alignment=TA_CENTER, textColor=PRIMARY_COLOR)
    story.append(Paragraph(f'<b>{quote_number}</b>', badge_style))
    story.append(Spacer(1, 20))
    
    # Customer and Quote Info
    customer_name = quote_data.get('customerName', 'Customer')
    customer_email = quote_data.get('customerEmail', '')
    customer_phone = quote_data.get('customerPhone', '')
    
    quote_date = quote_data.get('createdAt', '')
    valid_until = quote_data.get('validUntil', '')
    status = quote_data.get('status', 'draft')
    
    def format_date(date_str):
        if not date_str:
            return 'N/A'
        from datetime import datetime
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt.strftime('%d %b %Y')
        except:
            return 'N/A'
    
    info_data = [
        [Paragraph('<b>BILL TO</b>', heading_style), Paragraph('<b>QUOTE DETAILS</b>', heading_style)],
        [Paragraph(f'{customer_name}', bold_style), Paragraph(f'Quote Date: {format_date(quote_date)}', normal_style)],
        [Paragraph(f'{customer_email}', normal_style), Paragraph(f'Valid Until: {format_date(valid_until)}', normal_style)],
        [Paragraph(f'{customer_phone}', normal_style), Paragraph(f'Status: {status.upper()}', normal_style)],
    ]
    
    info_table = Table(info_data, colWidths=[250, 250])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F9FAFB')),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))
    
    # Quote Items
    items = quote_data.get('QuoteItem', [])
    
    # Table header style
    table_header_style = ParagraphStyle('TableHeader', parent=bold_style, textColor=colors.white, alignment=TA_CENTER)
    table_cell_style = ParagraphStyle('TableCell', parent=normal_style, alignment=TA_CENTER)
    table_cell_left = ParagraphStyle('TableCellLeft', parent=normal_style, alignment=TA_LEFT)
    table_cell_right = ParagraphStyle('TableCellRight', parent=normal_style, alignment=TA_RIGHT)
    
    # Items table
    table_data = [
        [
            Paragraph('<b>#</b>', table_header_style),
            Paragraph('<b>Product</b>', table_header_style),
            Paragraph('<b>Qty</b>', table_header_style),
            Paragraph('<b>Unit Price</b>', table_header_style),
            Paragraph('<b>Total</b>', table_header_style)
        ]
    ]
    
    def format_currency(amount):
        return f'₹{amount:,.0f}'
    
    for idx, item in enumerate(items, 1):
        table_data.append([
            Paragraph(str(idx), table_cell_style),
            Paragraph(item.get('productName', ''), table_cell_left),
            Paragraph(str(item.get('quantity', 0)), table_cell_style),
            Paragraph(format_currency(item.get('price', 0)), table_cell_right),
            Paragraph(format_currency(item.get('total', 0)), table_cell_right)
        ])
    
    items_table = Table(table_data, colWidths=[30, 200, 50, 100, 100])
    items_table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        # Alternating rows
        *[('BACKGROUND', (0, i), (-1, i), colors.white if i % 2 == 1 else colors.HexColor('#F9FAFB')) for i in range(1, len(table_data))],
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 20))
    
    # Totals
    subtotal = quote_data.get('subtotal', 0)
    tax = quote_data.get('tax', 0)
    discount = quote_data.get('discount', 0)
    total = quote_data.get('total', 0)
    
    totals_data = [
        ['', Paragraph('Subtotal:', table_cell_right), Paragraph(format_currency(subtotal), table_cell_right)],
    ]
    if tax > 0:
        totals_data.append(['', Paragraph('Tax (GST):', table_cell_right), Paragraph(format_currency(tax), table_cell_right)])
    if discount > 0:
        totals_data.append(['', Paragraph('Discount:', ParagraphStyle('Discount', parent=table_cell_right, textColor=colors.HexColor('#059669'))), 
                           Paragraph(f'-{format_currency(discount)}', ParagraphStyle('Discount', parent=table_cell_right, textColor=colors.HexColor('#059669')))])
    totals_data.append(['', Paragraph('<b>Total:</b>', ParagraphStyle('TotalLabel', parent=bold_style, alignment=TA_RIGHT)), 
                        Paragraph(f'<b>{format_currency(total)}</b>', ParagraphStyle('TotalValue', parent=bold_style, alignment=TA_RIGHT, textColor=PRIMARY_COLOR, fontSize=14))])
    
    totals_table = Table(totals_data, colWidths=[250, 120, 100])
    totals_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEABOVE', (1, -1), (-1, -1), 2, PRIMARY_COLOR),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 30))
    
    # Notes & Terms
    notes = quote_data.get('notes', '')
    terms = quote_data.get('terms', '')
    
    if notes or terms:
        story.append(Table([['']], colWidths=[500], style=[('LINEABOVE', (0, 0), (-1, -1), 1, BORDER_COLOR)]))
        story.append(Spacer(1, 10))
        
        notes_terms_data = []
        if notes:
            notes_terms_data.append([
                Paragraph('<b>Notes:</b>', bold_style),
                Paragraph(notes, normal_style)
            ])
        if terms:
            notes_terms_data.append([
                Paragraph('<b>Terms & Conditions:</b>', bold_style),
                Paragraph(terms, ParagraphStyle('Terms', parent=normal_style, fontSize=9))
            ])
        
        if notes_terms_data:
            notes_table = Table(notes_terms_data, colWidths=[120, 380])
            notes_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(notes_table)
    
    # Footer
    story.append(Spacer(1, 40))
    story.append(Table([['']], colWidths=[500], style=[('LINEABOVE', (0, 0), (-1, -1), 1, BORDER_COLOR)]))
    story.append(Spacer(1, 10))
    
    footer_style = ParagraphStyle('Footer', parent=normal_style, alignment=TA_CENTER, fontSize=9, textColor=TEXT_GRAY)
    story.append(Paragraph('Thank you for your business!', footer_style))
    story.append(Paragraph(f'For any queries, contact us at {company_email}', footer_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph('GSTIN: 09XXXXXXXXXX | PAN: XXXXXXXXX', footer_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer


@app.route('/generate-quote-pdf', methods=['POST'])
def generate_quote_pdf():
    try:
        data = request.json
        quote_data = data.get('quote', {})
        settings_data = data.get('settings', {})
        
        pdf_buffer = create_quote_pdf(quote_data, settings_data)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"{quote_data.get('quoteNumber', 'quote')}.pdf"
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
