const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const BillingDocumentService = require("../../services/billing/BillingDocumentService");

const safeText = (v) => String(v ?? "").trim();

const formatDateTime = (date) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date || new Date());

const formatDateOnly = (date) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium"
  }).format(date || new Date());

const getWorkspaceRoot = () => path.resolve(__dirname, "../../../../");

const getBrandLogoCandidates = () => {
  const root = getWorkspaceRoot();
  return [
    path.join(root, "frontend-angular", "public", "favicon.ico"),
    path.join(root, "frontend-angular", "public", "favicon.png"),
    path.join(root, "frontend-angular", "public", "logo.png"),
    path.join(root, "frontend-angular", "public", "logo.jpg"),
    path.join(root, "LoopingImage.jpg")
  ];
};

const tryDrawLogo = (doc, x, y, size) => {
  const candidates = getBrandLogoCandidates();
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      doc.image(p, x, y, { width: size, height: size });
      return true;
    } catch (_) {
      // ignore et essayer le suivant (ex: .ico non supporté)
    }
  }
  return false;
};

const ensureSpace = (doc, neededHeight) => {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + neededHeight <= bottom) return false;
  doc.addPage();
  return true;
};

const drawHeader = (doc, { title, orderId, issuedAt }) => {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const top = doc.page.margins.top;

  const headerHeight = 74;
  doc.save();
  doc.rect(left, top, right - left, headerHeight).fill("#F8FAFC");
  doc.restore();

  const logoX = left + 12;
  const logoY = top + 12;
  const logoSize = 50;
  const hasLogo = tryDrawLogo(doc, logoX, logoY, logoSize);

  const textX = hasLogo ? logoX + logoSize + 12 : logoX;
  doc.fillColor("#0F172A");
  doc.font("Helvetica-Bold").fontSize(18).text(`KORUS Center`, textX, top + 14, {
    width: right - textX - 12
  });
  doc.font("Helvetica").fontSize(10).fillColor("#334155").text(
    `Commande: ${safeText(orderId)}`,
    textX,
    top + 38,
    { width: right - textX - 12 }
  );
  doc.text(`Émis le: ${formatDateTime(issuedAt)}`, textX, top + 52, {
    width: right - textX - 12
  });

  // Badge titre (FACTURE / REÇU)
  const badgeW = 120;
  const badgeH = 26;
  const badgeX = right - badgeW - 12;
  const badgeY = top + 22;
  doc.save();
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 8).fill("#0F172A");
  doc.restore();
  doc.fillColor("#FFFFFF");
  doc.font("Helvetica-Bold").fontSize(11).text(title, badgeX, badgeY + 7, {
    width: badgeW,
    align: "center"
  });

  doc.fillColor("#000000");
  doc.y = top + headerHeight + 18;
};

const drawSectionTitle = (doc, label) => {
  ensureSpace(doc, 24);
  doc.fillColor("#0F172A");
  doc.font("Helvetica-Bold").fontSize(11).text(label);
  doc.moveDown(0.25);
  doc.fillColor("#334155");
  doc.font("Helvetica");
};

const drawKeyValueRow = (doc, leftLabel, leftValue, rightLabel, rightValue) => {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const gap = 14;
  const colW = (right - left - gap) / 2;
  const y = doc.y;

  doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748B").text(leftLabel, left, y, {
    width: colW
  });
  doc.font("Helvetica").fontSize(10).fillColor("#0F172A").text(leftValue, left, y + 12, {
    width: colW
  });

  doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748B").text(rightLabel, left + colW + gap, y, {
    width: colW
  });
  doc.font("Helvetica").fontSize(10).fillColor("#0F172A").text(rightValue, left + colW + gap, y + 12, {
    width: colW
  });

  doc.y = y + 34;
};

const mapPaymentStatusLabel = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "WAITING_CONFIRMATION") return "En attente";
  if (s === "CONFIRMED") return "Confirmée";
  if (s === "IN_PREPARATION") return "En préparation";
  if (s === "SHIPPED") return "Expédiée";
  if (s === "DELIVERY_EFFECTED") return "Livrée";
  if (s === "REJECTED") return "Annulée";
  return s || "-";
};

const writeBuyerBlock = (doc, order) => {
  const buyerName = safeText(order?.buyer?.name || order?.buyer?.firstName);
  const buyerEmail = safeText(order?.buyer?.email);

  drawSectionTitle(doc, "Client");
  const name = buyerName || "-";
  const email = buyerEmail || "-";
  drawKeyValueRow(doc, "Nom", name, "Email", email);
};

const writeOrderBlock = (doc, order) => {
  drawSectionTitle(doc, "Commande");
  const orderId = safeText(order?._id);
  const orderDate = order?.created_at ? new Date(order.created_at) : new Date();
  const total = BillingDocumentService.formatMoney(order?.total);

  drawKeyValueRow(doc, "N° commande", orderId || "-", "Date", formatDateOnly(orderDate));

  ensureSpace(doc, 18);
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748B").text("Total", {
    continued: false
  });
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#0F172A").text(total, {
    align: "right"
  });
  doc.moveDown(0.75);
};

const writePaymentBlock = (doc, payment) => {
  drawSectionTitle(doc, "Paiement");
  if (!payment) {
    drawKeyValueRow(doc, "Méthode", "-", "Statut", "Non effectué");
    doc.moveDown(0.5);
    return;
  }

  const method = safeText(payment.method || payment.provider || "-");
  const status = mapPaymentStatusLabel(payment.status);
  drawKeyValueRow(doc, "Méthode", method, "Statut", status);

  if (payment.amount != null) {
    ensureSpace(doc, 14);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748B").text("Montant", {
      continued: true
    });
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#0F172A").text(
      `  ${BillingDocumentService.formatMoney(payment.amount)}`,
      { align: "left" }
    );
  }
  doc.moveDown(0.75);
};

const drawTableHeader = (doc) => {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const totalWidth = right - left;
  const y = doc.y;

  doc.save();
  doc.rect(left, y, right - left, 22).fill("#F1F5F9");
  doc.restore();

  const pad = 8;
  const colName = 250;
  const colQty = 40;
  const colUnit = 90;
  const colPromo = 60;
  const colTotal = Math.max(60, totalWidth - pad * 2 - (colName + colQty + colUnit + colPromo));

  const xName = left + pad;
  const xQty = xName + colName;
  const xUnit = xQty + colQty;
  const xPromo = xUnit + colUnit;
  const xTotal = xPromo + colPromo;

  doc.font("Helvetica-Bold").fontSize(9).fillColor("#0F172A");
  doc.text("Article", xName, y + 6, { width: colName });
  doc.text("Qté", xQty, y + 6, { width: colQty, align: "right" });
  doc.text("PU", xUnit, y + 6, { width: colUnit, align: "right" });
  doc.text("Remise", xPromo, y + 6, { width: colPromo, align: "right" });
  doc.text("Total", xTotal, y + 6, { width: colTotal, align: "right" });

  doc.fillColor("#334155");
  doc.font("Helvetica");
  doc.y = y + 28;
};

const writeLinesTable = (doc, { lines, subtotalLabel, totalLabel }) => {
  drawSectionTitle(doc, "Articles");
  drawTableHeader(doc);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const totalWidth = right - left;
  const pad = 8;
  const colName = 250;
  const colQty = 40;
  const colUnit = 90;
  const colPromo = 60;
  const colTotal = Math.max(60, totalWidth - pad * 2 - (colName + colQty + colUnit + colPromo));

  const xName = left + pad;
  const xQty = xName + colName;
  const xUnit = xQty + colQty;
  const xPromo = xUnit + colUnit;
  const xTotal = xPromo + colPromo;
  doc.font("Helvetica").fontSize(9).fillColor("#0F172A");

  for (const line of lines || []) {
    const newPage = ensureSpace(doc, 30);
    if (newPage) {
      drawTableHeader(doc);
    }

    const name = safeText(line.productName) || "Produit";
    const qty = Number(line.quantity || 0);
    const unitPrice = BillingDocumentService.formatMoney(line.discountedUnit || 0).replace(" MGA", "");
    const promo = Number(line.promoPct || 0);
    const promoTxt = promo > 0 ? `-${promo}%` : "-";
    const total = BillingDocumentService.formatMoney(line.lineTotal || 0).replace(" MGA", "");

    const y = doc.y;
    doc.text(name, xName, y, { width: colName });
    doc.text(String(qty), xQty, y, { width: colQty, align: "right" });
    doc.text(unitPrice, xUnit, y, { width: colUnit, align: "right" });
    doc.text(promoTxt, xPromo, y, { width: colPromo, align: "right" });
    doc.text(total, xTotal, y, { width: colTotal, align: "right" });
    doc.y = y + 16;

    doc.save();
    doc.strokeColor("#E2E8F0");
    doc.moveTo(left, doc.y).lineTo(right, doc.y).stroke();
    doc.restore();
    doc.y += 6;
  }

  ensureSpace(doc, 44);
  doc.moveDown(0.25);
  doc.font("Helvetica").fontSize(10).fillColor("#334155").text(`Sous-total: ${subtotalLabel}`, {
    align: "right"
  });
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0F172A").text(`Total: ${totalLabel}`, {
    align: "right"
  });
  doc.moveDown(0.25);
};

const writeFooter = (doc) => {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const y = doc.page.height - doc.page.margins.bottom + 10;

    doc.save();
    doc.strokeColor("#E2E8F0");
    doc.moveTo(left, y - 8).lineTo(right, y - 8).stroke();
    doc.restore();

    doc.font("Helvetica").fontSize(9).fillColor("#64748B").text(
      `contact@korus-center.mg  •  Page ${i + 1}/${range.count}`,
      left,
      y,
      { width: right - left, align: "center" }
    );
  }
  doc.switchToPage(range.count - 1);
};

const streamPdf = ({ res, filename, title, data }) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);

  const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
  doc.pipe(res);

  drawHeader(doc, {
    title,
    orderId: safeText(data?.order?._id),
    issuedAt: data?.issuedAt || new Date()
  });

  writeOrderBlock(doc, data?.order);
  writeBuyerBlock(doc, data?.order);
  writePaymentBlock(doc, data?.payment);
  writeLinesTable(doc, data);

  writeFooter(doc);

  doc.end();
};

exports.downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const data = await BillingDocumentService.buildInvoiceData({
      orderId,
      userId: req.user.id
    });

    streamPdf({
      res,
      filename: `facture-${orderId}.pdf`,
      title: "FACTURE",
      data
    });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Erreur" });
  }
};

exports.downloadReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const data = await BillingDocumentService.buildReceiptData({
      orderId,
      userId: req.user.id
    });

    streamPdf({
      res,
      filename: `recu-${orderId}.pdf`,
      title: "REÇU",
      data
    });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Erreur" });
  }
};
