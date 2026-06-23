import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
} from 'docx';

/**
 * Datos de la empresa para el encabezado del documento (plantilla tomada
 * del formato real de cotización de la empresa). Hoy van fijos acá; si más
 * adelante existe una pantalla de Configuración con estos datos, esto
 * debería leerse de ahí en vez de quedar hardcodeado.
 */
const COMPANY = {
  name: 'TECPROSULA INVERSIONES',
  legalName: 'TECNICOS PROFESIONALES DE SULA INVERSIONES S. DE R.L. DE C.V.',
  tagline: 'LA SOLUCIÓN A TU DISPOSICIÓN',
  address: 'Res. Montebello, S.P.S., Cortés',
  phones: '(504) 9897-3459 · (504) 8805-5190',
  email: 'tecprosula.inversiones@hotmail.com',
  rtn: '0501-9026-309470',
};

const NAVY = '1E293B';
const LIGHT_GRAY = 'F1F5F9';
const BORDER_GRAY = 'E2E8F0';
const TEXT_DARK = '0F172A';
const TEXT_MUTED = '64748B';
const NOTE_RED = 'B91C1C';
const WHITE = 'FFFFFF';

const PAGE_WIDTH_TWIPS = 9360; // letter, márgenes de 0.5in

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0, color: WHITE },
  bottom: { style: BorderStyle.NONE, size: 0, color: WHITE },
  left: { style: BorderStyle.NONE, size: 0, color: WHITE },
  right: { style: BorderStyle.NONE, size: 0, color: WHITE },
};

function borderAll(color = BORDER_GRAY, size = 4) {
  return {
    top: { style: BorderStyle.SINGLE, size, color },
    bottom: { style: BorderStyle.SINGLE, size, color },
    left: { style: BorderStyle.SINGLE, size, color },
    right: { style: BorderStyle.SINGLE, size, color },
  };
}

function cell({ children, width, shading, borders = NO_BORDERS, verticalAlign = VerticalAlign.CENTER, margins }) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shading ? { type: ShadingType.CLEAR, color: 'auto', fill: shading } : undefined,
    borders,
    verticalAlign,
    margins: margins ?? { top: 60, bottom: 60, left: 100, right: 100 },
    children,
  });
}

function textPara(text, { bold, italics, color, size = 17, alignment } = {}) {
  return new Paragraph({
    alignment,
    children: [new TextRun({ text, bold, italics, color, size })],
  });
}

/**
 * Construye el Document (docx) de una cotización, siguiendo la plantilla
 * real de la empresa: encabezado con datos de la empresa + caja Fecha/Cot
 * N°, franja "Atencion"/"Cotizamos", tabla de líneas (Título + Descripción
 * por ítem) y el desglose Subtotal / Tarifa de Intermediación y Garantía
 * de Servicio / ISV (15%) / Total.
 *
 * No depende de campos que todavía no existan en el modelo: usa
 * quote.notes para la franja de observaciones (no hay un campo propio de
 * "tiempo de entrega" todavía), y tiene fallback para cotizaciones viejas
 * sin `subtotal`/`intermediationFee`/`tax` (las de los mocks iniciales) —
 * el ISV se calcula al vuelo si no viene guardado.
 */
function buildQuoteDocument(quote, request) {
  const items = quote.items ?? [];

  // ---- Encabezado: datos de la empresa (izq) + caja Fecha/Cot N° (der) ----
  const headerTable = new Table({
    width: { size: PAGE_WIDTH_TWIPS, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          cell({
            width: 6500,
            borders: NO_BORDERS,
            children: [
              textPara(COMPANY.name, { bold: true, color: NAVY, size: 30 }),
              textPara(COMPANY.tagline, { color: TEXT_MUTED, size: 15 }),
              textPara(COMPANY.legalName, { color: TEXT_DARK, size: 15 }),
              textPara(`Dirección: ${COMPANY.address}`, { color: TEXT_DARK, size: 15 }),
              textPara(`Teléfonos: ${COMPANY.phones}`, { color: TEXT_DARK, size: 15 }),
              textPara(`E-mail: ${COMPANY.email}`, { color: TEXT_DARK, size: 15 }),
              textPara(`R.T.N: ${COMPANY.rtn}`, { color: TEXT_DARK, size: 15 }),
            ],
          }),
          cell({
            width: 2860,
            borders: borderAll(),
            verticalAlign: VerticalAlign.TOP,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Fecha: ', bold: true, size: 16, color: TEXT_DARK }),
                  new TextRun({ text: quote.date ?? '', size: 16, color: TEXT_DARK }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Cot. N°: ', bold: true, size: 16, color: TEXT_DARK }),
                  new TextRun({ text: quote.id ?? '', size: 16, color: TEXT_DARK }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // ---- Atencion / Cotizamos ----
  const atencionTable = new Table({
    width: { size: PAGE_WIDTH_TWIPS, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          cell({
            width: 7000,
            shading: LIGHT_GRAY,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Atencion: ', bold: true, size: 19, color: TEXT_DARK }),
                  new TextRun({ text: request?.client ?? '', size: 19, color: TEXT_DARK }),
                ],
              }),
            ],
          }),
          cell({
            width: 2360,
            shading: LIGHT_GRAY,
            children: [textPara('Cotizamos', { bold: true, size: 19, color: TEXT_DARK, alignment: AlignmentType.RIGHT })],
          }),
        ],
      }),
    ],
  });

  // ---- Tabla de líneas ----
  const colWidths = { item: 600, cant: 900, desc: 5260, precio: 1300, monto: 1300 };

  function headerCell(text, width) {
    return cell({
      width,
      shading: NAVY,
      borders: borderAll(NAVY),
      children: [textPara(text, { bold: true, color: WHITE, size: 16 })],
    });
  }

  const tableHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('Item', colWidths.item),
      headerCell('Cantidad', colWidths.cant),
      headerCell('Descripción', colWidths.desc),
      headerCell('Precio unidad', colWidths.precio),
      headerCell('Monto total', colWidths.monto),
    ],
  });

  const itemRows = items.map((item, index) => {
    const hasBoth = Boolean(item.title) && Boolean(item.description);
    const descChildren = [textPara(item.title || item.description || '', { bold: true, color: TEXT_DARK, size: 16 })];
    if (hasBoth) {
      descChildren.push(textPara(item.description, { color: TEXT_DARK, size: 16 }));
    }
    const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    return new TableRow({
      children: [
        cell({ width: colWidths.item, borders: borderAll(), children: [textPara(String(index + 1), { color: TEXT_DARK, size: 16 })] }),
        cell({ width: colWidths.cant, borders: borderAll(), children: [textPara(String(item.quantity ?? ''), { color: TEXT_DARK, size: 16 })] }),
        cell({ width: colWidths.desc, borders: borderAll(), children: descChildren }),
        cell({ width: colWidths.precio, borders: borderAll(), children: [textPara(fmt(item.unitPrice), { color: TEXT_DARK, size: 16 })] }),
        cell({ width: colWidths.monto, borders: borderAll(), children: [textPara(fmt(lineTotal), { color: TEXT_DARK, size: 16 })] }),
      ],
    });
  });

  const itemsTable = new Table({
    width: { size: PAGE_WIDTH_TWIPS, type: WidthType.DXA },
    rows: [tableHeaderRow, ...itemRows],
  });

  // ---- Notas (franja roja, si existen) ----
  const noteParas = quote.notes ? [textPara(quote.notes, { italics: true, color: NOTE_RED, size: 16 })] : [];

  // ---- Totales ----
  // ISV (Impuesto Sobre Ventas) de Honduras, 15% sobre subtotal + tarifa de
  // intermediación — igual que en AddQuoteModal. Si la cotización ya trae
  // `tax` (las creadas después de este cambio) se usa ese valor tal cual;
  // si no (cotizaciones viejas de los mocks, sin tax/subtotal/intermediationFee
  // propios), se calcula al vuelo para que el Word siempre lo muestre.
  const feePercent = quote.intermediationFee?.percent;
  const feeLabel = feePercent
    ? `Tarifa de Intermediación (${feePercent}%)`
    : 'Tarifa de Intermediación y Garantía de Servicio';

  const itemsSubtotal = items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0);
  const subtotal = quote.subtotal ?? quote.total ?? itemsSubtotal;
  const fee = quote.intermediationFee?.value ?? 0;
  const taxBase = subtotal + fee;
  const tax = quote.tax ?? taxBase * 0.15;
  const total = taxBase + tax;

  const totalsRowsData = [
    ['Subtotal', fmt(subtotal), false],
    [feeLabel, fmt(fee), false],
    ['ISV (15%)', fmt(tax), false],
    ['Total', fmt(total), true],
  ];

  const totalsTable = new Table({
    alignment: AlignmentType.RIGHT,
    width: { size: 4400, type: WidthType.DXA },
    rows: totalsRowsData.map(([label, value, isTotal]) => new TableRow({
      children: [
        cell({
          width: 2800,
          shading: isTotal ? NAVY : LIGHT_GRAY,
          borders: borderAll(),
          children: [textPara(label, { bold: isTotal, color: isTotal ? WHITE : TEXT_DARK, size: 16 })],
        }),
        cell({
          width: 1600,
          shading: isTotal ? NAVY : LIGHT_GRAY,
          borders: borderAll(),
          children: [textPara(value, { bold: isTotal, color: isTotal ? WHITE : TEXT_DARK, size: 16, alignment: AlignmentType.RIGHT })],
        }),
      ],
    })),
  });

  // ---- Pie ----
  const footerParas = [
    textPara('Crédito sujeto a aprobación, a través de orden de compra.', { color: TEXT_MUTED, size: 14 }),
    textPara('Oferta válida por 20 días a partir de la fecha indicada en esta cotización.', { color: TEXT_MUTED, size: 14 }),
  ];

  return new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        children: [
          headerTable,
          new Paragraph({ text: '', spacing: { after: 160 } }),
          atencionTable,
          new Paragraph({ text: '', spacing: { after: 160 } }),
          itemsTable,
          new Paragraph({ text: '', spacing: { after: 120 } }),
          ...noteParas,
          new Paragraph({ text: '', spacing: { after: 120 } }),
          totalsTable,
          new Paragraph({ text: '', spacing: { before: 240, after: 80 } }),
          ...footerParas,
        ],
      },
    ],
  });
}

/**
 * Genera y descarga un documento Word (.docx) editable de la cotización,
 * con la misma plantilla visual que antes se generaba en PDF — la idea es
 * que se pueda abrir en Word y ajustar texto/formato a mano si hace falta
 * antes de mandarla al cliente.
 *
 * @param {object} quote - cotización (ver mocks/quotes.js), con items,
 *   subtotal, intermediationFee y total.
 * @param {{ client?: string }} [request] - solicitud asociada, para
 *   mostrar el cliente en "Atencion".
 */
export async function downloadQuoteDocx(quote, request) {
  const doc = buildQuoteDocument(quote, request);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${quote.id || 'cotizacion'}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
