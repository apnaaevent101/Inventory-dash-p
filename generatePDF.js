import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const PRIMARY = [26, 58, 42]
const GOLD = [160, 120, 50]
const LIGHT = [250, 247, 242]

export function generateDispatchPDF(event) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  // ── Header band ──────────────────────────────────────────────
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageW, 38, 'F')

  doc.setTextColor(201, 168, 76)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('DISPATCH SHEET', pageW / 2, 16, { align: 'center' })

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('EventStock — Inventory Manager', pageW / 2, 24, { align: 'center' })
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageW / 2, 30, { align: 'center' })

  // ── Event info card ───────────────────────────────────────────
  doc.setFillColor(...LIGHT)
  doc.roundedRect(14, 44, pageW - 28, 36, 3, 3, 'F')
  doc.setDrawColor(...PRIMARY)
  doc.setLineWidth(0.4)
  doc.roundedRect(14, 44, pageW - 28, 36, 3, 3, 'S')

  const col1x = 22, col2x = pageW / 2 + 8
  doc.setTextColor(...GOLD)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('VENUE', col1x, 52)
  doc.text('EVENT TYPE', col2x, 52)
  doc.text('EVENT DATE', col1x, 66)
  doc.text('DISPATCH ID', col2x, 66)

  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(event.venue, col1x, 59)
  doc.text(event.type, col2x, 59)
  doc.text(new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), col1x, 73)
  doc.text(`#DS-${event.id?.toString().slice(-6)}`, col2x, 73)

  // ── Items table ───────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...PRIMARY)
  doc.text('DISPATCHED ITEMS', 14, 92)

  autoTable(doc, {
    startY: 96,
    head: [['#', 'Item Name', 'Quantity']],
    body: event.items.map((item, i) => [
      String(i + 1).padStart(2, '0'),
      item.name,
      item.quantity,
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY,
      textColor: [201, 168, 76],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    bodyStyles: { fontSize: 9.5, textColor: [40, 40, 40] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14 },
      2: { halign: 'center', cellWidth: 28 },
    },
    alternateRowStyles: { fillColor: [248, 245, 240] },
    margin: { left: 14, right: 14 },
  })

  // ── Labor table ───────────────────────────────────────────────
  const afterItems = doc.lastAutoTable.finalY + 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...PRIMARY)
  doc.text('ASSIGNED LABOR', 14, afterItems)

  autoTable(doc, {
    startY: afterItems + 4,
    head: [['#', 'Labor Name', 'Status']],
    body: event.labors.filter(Boolean).map((l, i) => [
      String(i + 1).padStart(2, '0'),
      l,
      'Assigned',
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY,
      textColor: [201, 168, 76],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9.5, textColor: [40, 40, 40] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14 },
      2: { halign: 'center', cellWidth: 32, textColor: [20, 120, 60] },
    },
    alternateRowStyles: { fillColor: [248, 245, 240] },
    margin: { left: 14, right: 14 },
  })

  // ── Signature block ───────────────────────────────────────────
  const sigY = doc.lastAutoTable.finalY + 16
  if (sigY < 240) {
    doc.setDrawColor(200, 195, 185)
    doc.setLineWidth(0.3)
    doc.line(14, sigY, 80, sigY)
    doc.line(pageW - 80, sigY, pageW - 14, sigY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120, 115, 110)
    doc.text('Dispatched By', 14, sigY + 5)
    doc.text('Received By', pageW - 80, sigY + 5)
  }

  // ── Footer ────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFillColor(...PRIMARY)
  doc.rect(0, pageH - 12, pageW, 12, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(201, 168, 76)
  doc.text('EventStock — Inventory & Dispatch Management', pageW / 2, pageH - 5, { align: 'center' })

  const safeName = event.venue.replace(/[^a-zA-Z0-9]/g, '-')
  doc.save(`dispatch-${safeName}-${event.date}.pdf`)
}
