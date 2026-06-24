import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, VerticalAlign,
} from 'docx';

const COMPANY = {
  name: 'TECPROSULA INVERSIONES',
  legalName: 'TECNICOS PROFESIONALES DE SULA INVERSIONES S. DE R.L. DE C.V.',
  tagline: 'LA SOLUCIÓN A TU DISPOSICIÓN',
  address: 'Res. Montebello, S.P.S., Cortés',
  phones: '(504) 9897-3459 · (504) 8805-5190',
  email: 'tecprosula.inversiones@hotmail.com',
  rtn: '0501-9026-309470',
};

const NAVY      = '1E293B';
const LIGHT_GRAY = 'F1F5F9';
const BORDER_GRAY = 'E2E8F0';
const TEXT_DARK  = '0F172A';
const TEXT_MUTED = '64748B';
const NOTE_RED   = 'B91C1C';
const WHITE      = 'FFFFFF';
const PAGE_W     = 9360;

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const NO_BORDER = {
  top:    { style: BorderStyle.NONE, size: 0, color: WHITE },
  bottom: { style: BorderStyle.NONE, size: 0, color: WHITE },
  left:   { style: BorderStyle.NONE, size: 0, color: WHITE },
  right:  { style: BorderStyle.NONE, size: 0, color: WHITE },
};

function borderAll(color = BORDER_GRAY, size = 4) {
  const s = { style: BorderStyle.SINGLE, size, color };
  return { top: s, bottom: s, left: s, right: s };
}

function cell({ children, width, fill, borders = NO_BORDER, vAlign = VerticalAlign.CENTER, margins }) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, color: 'auto', fill } : undefined,
    borders,
    verticalAlign: vAlign,
    margins: margins ?? { top: 60, bottom: 60, left: 100, right: 100 },
    children,
  });
}

function para(text, { bold, italic, color = TEXT_DARK, size = 17, align } = {}) {
  return new Paragraph({
    alignment: align,
    children: [new TextRun({ text, bold, italics: italic, color, size })],
  });
}

function spacer(after = 100) {
  return new Paragraph({ text: '', spacing: { after } });
}

function buildQuoteDocument(quote, request) {
  const items = quote.items ?? [];

  // Cálculo correcto: subtotal siempre desde ítems
  const itemsSubtotal = items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0);
  const subtotal = items.length > 0 ? itemsSubtotal : 0;
  const feePercent = quote.intermediationFee?.percent;
  const feeLabel = feePercent
    ? `Tarifa de Intermediación (${feePercent}%)`
    : 'Tarifa de Intermediación y Garantía de Servicio';
  const fee = Number(quote.intermediationFee?.value ?? 0);
  const tax = (subtotal + fee) * 0.15;
  const total = subtotal + fee + tax;

  // ── ENCABEZADO ────────────────────────────────────────────────────────────
  const headerTable = new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [new TableRow({
      children: [
        cell({
          width: 6500,
          borders: NO_BORDER,
          children: [
            para(COMPANY.name,     { bold: true, color: NAVY, size: 30 }),
            para(COMPANY.tagline,  { color: TEXT_MUTED, size: 15 }),
            para(COMPANY.legalName,{ color: TEXT_DARK, size: 15 }),
            para(`Dirección: ${COMPANY.address}`, { color: TEXT_DARK, size: 15 }),
            para(`Teléfonos: ${COMPANY.phones}`,  { color: TEXT_DARK, size: 15 }),
            para(`E-mail: ${COMPANY.email}`,       { color: TEXT_DARK, size: 15 }),
            para(`R.T.N: ${COMPANY.rtn}`,          { color: TEXT_DARK, size: 15 }),
          ],
        }),
        cell({
          width: 2860,
          borders: borderAll(),
          vAlign: VerticalAlign.TOP,
          children: [
            new Paragraph({ children: [
              new TextRun({ text: 'Fecha: ', bold: true, size: 16, color: TEXT_DARK }),
              new TextRun({ text: quote.date ?? '', size: 16, color: TEXT_DARK }),
            ]}),
            new Paragraph({ children: [
              new TextRun({ text: 'Cot. N°: ', bold: true, size: 16, color: TEXT_DARK }),
              new TextRun({ text: String(quote.id ?? ''), size: 16, color: TEXT_DARK }),
            ]}),
          ],
        }),
      ],
    })],
  });

  // ── ATENCIÓN ──────────────────────────────────────────────────────────────
  const atencionTable = new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [new TableRow({
      children: [
        cell({
          width: 7000,
          fill: LIGHT_GRAY,
          borders: NO_BORDER,
          children: [new Paragraph({ children: [
            new TextRun({ text: 'Atencion: ', bold: true, size: 19, color: TEXT_DARK }),
            new TextRun({ text: request?.client ?? '', size: 19, color: TEXT_DARK }),
          ]})],
        }),
        cell({
          width: 2360,
          fill: LIGHT_GRAY,
          borders: NO_BORDER,
          children: [para('Cotizamos', { bold: true, size: 19, color: TEXT_DARK, align: AlignmentType.RIGHT })],
        }),
      ],
    })],
  });

  // ── TABLA DE ÍTEMS ────────────────────────────────────────────────────────
  const CW = { num: 600, cant: 900, desc: 5260, precio: 1300, monto: 1300 };

  function hCell(txt, width, align = AlignmentType.LEFT) {
    return cell({ width, fill: NAVY, borders: borderAll(NAVY), children: [para(txt, { bold: true, color: WHITE, size: 16, align })] });
  }

  const tableHeader = new TableRow({
    tableHeader: true,
    children: [
      hCell('Item', CW.num),
      hCell('Cantidad', CW.cant),
      hCell('Descripción', CW.desc),
      hCell('Precio unidad', CW.precio, AlignmentType.RIGHT),
      hCell('Monto total', CW.monto, AlignmentType.RIGHT),
    ],
  });

  const itemRows = items.map((item, idx) => {
    const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    const descChildren = [para(item.title || item.description || '', { bold: true, color: TEXT_DARK, size: 16 })];
    if (item.title && item.description) {
      descChildren.push(para(item.description, { italic: true, color: TEXT_MUTED, size: 15 }));
    }
    return new TableRow({
      children: [
        cell({ width: CW.num,    borders: borderAll(), children: [para(String(idx + 1), { color: TEXT_DARK, size: 16 })] }),
        cell({ width: CW.cant,   borders: borderAll(), children: [para(String(item.quantity ?? ''), { color: TEXT_DARK, size: 16 })] }),
        cell({ width: CW.desc,   borders: borderAll(), vAlign: VerticalAlign.TOP, children: descChildren }),
        cell({ width: CW.precio, borders: borderAll(), children: [para(fmt(item.unitPrice), { color: TEXT_DARK, size: 16, align: AlignmentType.RIGHT })] }),
        cell({ width: CW.monto,  borders: borderAll(), children: [para(fmt(lineTotal),      { bold: true, color: TEXT_DARK, size: 16, align: AlignmentType.RIGHT })] }),
      ],
    });
  });

  if (items.length === 0) {
    itemRows.push(new TableRow({
      children: [cell({ width: PAGE_W, borders: borderAll(), children: [para('—', { color: TEXT_MUTED, size: 16, align: AlignmentType.CENTER })] })],
    }));
  }

  const itemsTable = new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [tableHeader, ...itemRows],
  });

  // ── NOTAS ─────────────────────────────────────────────────────────────────
  const noteParas = quote.notes
    ? [para(quote.notes, { italic: true, color: NOTE_RED, size: 16 })]
    : [];

  // ── TOTALES ───────────────────────────────────────────────────────────────
  const TW = { label: 3600, value: 1600 };
  const totalsTable = new Table({
    alignment: AlignmentType.RIGHT,
    width: { size: TW.label + TW.value, type: WidthType.DXA },
    rows: [
      ['Subtotal',  fmt(subtotal), false],
      [feeLabel,    fmt(fee),      false],
      ['ISV (15%)', fmt(tax),      false],
      ['Total',     fmt(total),    true ],
    ].map(([label, value, isTotal]) => new TableRow({
      children: [
        cell({ width: TW.label, fill: isTotal ? NAVY : LIGHT_GRAY, borders: borderAll(), children: [para(label, { bold: isTotal, color: isTotal ? WHITE : TEXT_DARK, size: 16 })] }),
        cell({ width: TW.value, fill: isTotal ? NAVY : LIGHT_GRAY, borders: borderAll(), children: [para(value, { bold: isTotal, color: isTotal ? WHITE : TEXT_DARK, size: isTotal ? 18 : 16, align: AlignmentType.RIGHT })] }),
      ],
    })),
  });

  // ── PIE ───────────────────────────────────────────────────────────────────
  return new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      children: [
        headerTable,
        spacer(160),
        atencionTable,
        spacer(160),
        itemsTable,
        spacer(120),
        ...noteParas,
        ...(noteParas.length ? [spacer(80)] : []),
        totalsTable,
        spacer(200),
        para('Crédito sujeto a aprobación, a través de orden de compra.', { color: TEXT_MUTED, size: 14 }),
        para('Oferta válida por 20 días a partir de la fecha indicada en esta cotización.', { color: TEXT_MUTED, size: 14 }),
      ],
    }],
  });
}

export async function downloadQuoteDocx(quote, request) {
  const doc = buildQuoteDocument(quote, request);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const clientSlug = (request?.client || quote.client || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40);
  link.download = ['COT', quote.id, clientSlug].filter(Boolean).join('-') + '.docx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}