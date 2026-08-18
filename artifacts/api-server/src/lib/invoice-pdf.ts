import PDFDocument from "pdfkit";

export interface InvoiceLineItem {
  desc: string;
  qty: number;
  unitPrice: number;
  category?: string;
}

export interface InvoicePdfData {
  invoiceRef: string;
  customerName: string;
  customerLocation?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  sourceBdoId?: string | null;
  leadRef?: string | null;
  planName?: string | null;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  total: number;
  dueDate?: string | null;
  createdAt: string;
  approvedByName?: string | null;
  issuedAt?: string | null;
  warrantyPolicies?: string[];
}

const PRIMARY = "#f5c518";
const DARK = "#0a0a0a";
const MUTED = "#666666";
const BORDER = "#e5e5e5";

function formatNGN(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

export function generateInvoicePdf(invoice: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width - 100; // usable width

    // ── Header bar ──
    doc.rect(0, 0, doc.page.width, 8).fill(PRIMARY);

    // Logo text
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(22).fillColor(DARK).text("VERJ SOLAR", 50, 28);
    doc.font("Helvetica").fontSize(9).fillColor(MUTED).text("Energy Solutions", 50, 52);

    // Invoice label (top right)
    doc.font("Helvetica").fontSize(32).fillColor("#cccccc").text("INVOICE", 0, 28, { align: "right" });

    // Invoice meta (right column)
    const metaX = 350;
    let metaY = 72;
    const metaRow = (label: string, value: string) => {
      doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(label, metaX, metaY, { width: 90 });
      doc.font("Helvetica-Bold").fontSize(9).fillColor(DARK).text(value, metaX + 95, metaY, { width: 155, align: "right" });
      metaY += 16;
    };
    metaRow("Invoice No:", invoice.invoiceRef);
    metaRow("Date:", formatDate(invoice.createdAt));
    if (invoice.dueDate) metaRow("Due Date:", formatDate(invoice.dueDate));
    if (invoice.issuedAt) metaRow("Issued:", formatDate(invoice.issuedAt));

    // ── Divider ──
    doc.moveTo(50, 100).lineTo(doc.page.width - 50, 100).lineWidth(0.5).strokeColor(BORDER).stroke();

    // ── Bill To / BDO ──
    let y = 116;
    doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text("BILL TO", 50, y).text("SOURCE BDO", 350, y);
    y += 14;
    doc.font("Helvetica-Bold").fontSize(12).fillColor(DARK).text(invoice.customerName, 50, y);
    if (invoice.sourceBdoId) doc.font("Helvetica-Bold").fontSize(11).fillColor(PRIMARY).text(invoice.sourceBdoId, 350, y);
    y += 16;
    if (invoice.customerLocation) { doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(invoice.customerLocation, 50, y); y += 13; }
    if (invoice.customerPhone) { doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(invoice.customerPhone, 50, y); y += 13; }
    if (invoice.customerEmail) { doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(invoice.customerEmail, 50, y); y += 13; }
    if (invoice.leadRef) { doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`Lead: ${invoice.leadRef}`, 350, y - (invoice.customerPhone ? 13 : 0)); }

    y = Math.max(y, 175);

    // ── Plan name ──
    if (invoice.planName) {
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).lineWidth(0.5).strokeColor(BORDER).stroke();
      y += 10;
      doc.font("Helvetica-Bold").fontSize(11).fillColor(DARK).text(invoice.planName, 50, y);
      y += 20;
    } else {
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).lineWidth(0.5).strokeColor(BORDER).stroke();
      y += 14;
    }

    // ── Line items table header ──
    doc.rect(50, y, W, 22).fill("#f9f9f9");
    doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED);
    doc.text("DESCRIPTION", 56, y + 7);
    doc.text("QTY", 350, y + 7, { width: 50, align: "right" });
    doc.text("UNIT PRICE", 406, y + 7, { width: 90, align: "right" });
    doc.text("AMOUNT", 50, y + 7, { width: W - 6, align: "right" });
    y += 22;

    // ── Line items ──
    doc.font("Helvetica").fontSize(9).fillColor(DARK);
    for (const item of invoice.lineItems) {
      const amount = item.qty * item.unitPrice;
      const rowH = 22;
      if (y + rowH > doc.page.height - 160) {
        doc.addPage();
        y = 50;
      }
      doc.moveTo(50, y + rowH).lineTo(doc.page.width - 50, y + rowH).lineWidth(0.3).strokeColor(BORDER).stroke();
      doc.font("Helvetica").fontSize(9).fillColor(DARK).text(item.desc, 56, y + 6, { width: 288 });
      doc.text(String(item.qty), 350, y + 6, { width: 50, align: "right" });
      doc.fillColor(MUTED).text(formatNGN(item.unitPrice), 406, y + 6, { width: 90, align: "right" });
      doc.fillColor(DARK).font("Helvetica-Bold").text(formatNGN(amount), 50, y + 6, { width: W - 6, align: "right" });
      doc.font("Helvetica");
      y += rowH;
    }

    y += 10;

    // ── Totals ──
    const vat = invoice.subtotal * 0.075;
    const totalsX = 350;
    const totalsW = W - 300;

    const totalRow = (label: string, val: string, bold = false, highlight = false) => {
      if (bold) doc.font("Helvetica-Bold"); else doc.font("Helvetica");
      doc.fontSize(highlight ? 12 : 9).fillColor(highlight ? PRIMARY : bold ? DARK : MUTED);
      doc.text(label, totalsX, y, { width: totalsW * 0.55 });
      doc.text(val, totalsX, y, { width: totalsW, align: "right" });
      y += highlight ? 20 : 16;
    };

    doc.moveTo(totalsX, y).lineTo(doc.page.width - 50, y).lineWidth(0.5).strokeColor(BORDER).stroke();
    y += 8;
    totalRow("Subtotal", formatNGN(invoice.subtotal));
    totalRow("VAT (7.5%)", formatNGN(vat));
    doc.moveTo(totalsX, y).lineTo(doc.page.width - 50, y).lineWidth(1).strokeColor(DARK).stroke();
    y += 6;
    totalRow("TOTAL DUE", formatNGN(invoice.total), true, true);

    y += 10;

    // ── Warranty policies ──
    if (invoice.warrantyPolicies && invoice.warrantyPolicies.length > 0) {
      if (y + 80 > doc.page.height - 80) { doc.addPage(); y = 50; }
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).lineWidth(0.5).strokeColor(BORDER).stroke();
      y += 10;
      doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text("WARRANTY & POLICIES", 50, y);
      y += 14;
      for (const policy of invoice.warrantyPolicies) {
        doc.font("Helvetica").fontSize(9).fillColor(DARK).text(`• ${policy}`, 56, y, { width: W - 10 });
        y += 14;
      }
    }

    // ── Footer ──
    const footerY = doc.page.height - 70;
    doc.rect(0, footerY, doc.page.width, 70).fill("#f9f9f9");
    doc.moveTo(0, footerY).lineTo(doc.page.width, footerY).lineWidth(1).strokeColor(PRIMARY).stroke();
    doc.font("Helvetica").fontSize(8).fillColor(MUTED)
      .text("Payment is due within 14 days of invoice date.", 50, footerY + 12)
      .text("Bank: GTBank  •  Account: 0123456789  •  VERJ SOLAR ENERGY SOLUTIONS LTD", 50, footerY + 26)
      .text("9 Badaru Street, Jakande, Lekki, Lagos  •  hello@verj.ng  •  +234 800 VERJ SOL", 50, footerY + 40);
    if (invoice.approvedByName) {
      doc.font("Helvetica-Bold").fontSize(8).fillColor(DARK)
        .text(`Approved by: ${invoice.approvedByName}`, 0, footerY + 12, { align: "right", width: doc.page.width - 50 });
    }

    doc.end();
  });
}
