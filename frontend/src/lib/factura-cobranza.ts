import jsPDF from "jspdf";
import { formatFecha, formatMiles } from "./format";

export interface FacturaData {
  nroComprobante: number;
  timbrado: number;
  fecha: string;
  alumnoCI: string;
  alumnoNombre: string;
  alumnoApellido: string;
  cursoNombre: string;
  mesPagado: string;
  cantMeses: number;
  subtotalCuota: number;
  incluyeFebrero: boolean;
  importeCuota: number; // importe mensual completo del curso
  adicionalDetalle: string;
  adicionalMonto: number;
  descuento: number;
}

/* ─── Posiciones (mm) ajustables para cuadrar con la factura pre-impresa ─── */

// Offset Y donde comienza cada copia en la página
const COPIA_1_Y = 0;   // Original: Cliente
const COPIA_2_Y = 148;  // Duplicado: Archivo Tributario

// Posiciones relativas al inicio de cada copia
const POS = {
  // Fecha de emisión
  fechaX: 50,
  fechaY: 47,

  // Condición de venta (X en casilla CONTADO)
  contadoX: 158,
  contadoY: 47,

  // RUC (usamos CI del alumno)
  rucX: 22,
  rucY: 55,

  // Nombre o Razón Social
  nombreX: 55,
  nombreY: 63,

  // Grado/Curso
  cursoX: 148,
  cursoY: 63,

  // Tabla de items - primera fila
  tablaY: 82,
  tablaLineH: 6,
  cantX: 20,
  descX: 38,
  precioX: 110,
  exentasX: 140,
  iva10X_col: 175,  // columna 10% en la tabla de items

  // Total a pagar (en guaraníes)
  totalY: 122,
  totalX: 175,

  // Liquidación IVA
  ivaY: 132,
  iva5X: 60,
  iva10X: 100,
  ivaTotalX: 145,
};

function dibujarFactura(doc: jsPDF, data: FacturaData, offsetY: number) {
  const y = (pos: number) => offsetY + pos;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // Fecha de emisión
  doc.text(formatFecha(data.fecha), POS.fechaX, y(POS.fechaY));

  // Condición de venta: CONTADO
  doc.setFontSize(11);
  doc.text("X", POS.contadoX, y(POS.contadoY));
  doc.setFontSize(9);

  // RUC (CI del alumno)
  doc.text(data.alumnoCI, POS.rucX, y(POS.rucY));

  // Nombre o Razón Social
  doc.text(`${data.alumnoNombre} ${data.alumnoApellido}`, POS.nombreX, y(POS.nombreY));

  // Grado/Curso
  doc.text(data.cursoNombre, POS.cursoX, y(POS.cursoY));

  // ── Tabla de items ──
  let filaY = POS.tablaY;

  // Separar febrero de los demás meses
  const meses = data.mesPagado.split(", ").filter(Boolean);
  const mesesSinFeb = meses.filter((m) => m !== "FEBRERO");
  const importeFeb = data.incluyeFebrero ? Math.floor(data.importeCuota / 2) : 0;
  const subtotalSinFeb = data.subtotalCuota - importeFeb;

  // Fila: Febrero aparte (50% cuota) → columna EXENTAS
  if (data.incluyeFebrero) {
    doc.text("1", POS.cantX, y(filaY), { align: "center" });
    doc.text("CUOTA MENSUAL - FEBRERO (50%)", POS.descX, y(filaY));
    doc.text(formatMiles(importeFeb), POS.precioX, y(filaY), { align: "right" });
    doc.text(formatMiles(importeFeb), POS.exentasX, y(filaY), { align: "right" });
    filaY += POS.tablaLineH;
  }

  // Fila: Resto de meses agrupados → columna EXENTAS
  if (mesesSinFeb.length > 0 && subtotalSinFeb > 0) {
    doc.text(String(mesesSinFeb.length), POS.cantX, y(filaY), { align: "center" });
    doc.text(`CUOTA MENSUAL - ${mesesSinFeb.join(", ")}`, POS.descX, y(filaY));
    doc.text(formatMiles(data.importeCuota), POS.precioX, y(filaY), { align: "right" });
    doc.text(formatMiles(subtotalSinFeb), POS.exentasX, y(filaY), { align: "right" });
    filaY += POS.tablaLineH;
  }

  // Fila 2: Adicional (examen u otro) → columna 10%
  if (data.adicionalMonto > 0) {
    doc.text("1", POS.cantX, y(filaY), { align: "center" });
    doc.text(data.adicionalDetalle || "ADICIONAL", POS.descX, y(filaY));
    doc.text(formatMiles(data.adicionalMonto), POS.precioX, y(filaY), { align: "right" });
    doc.text(formatMiles(data.adicionalMonto), POS.iva10X_col, y(filaY), { align: "right" });
    filaY += POS.tablaLineH;
  }

  // Descuento (si aplica)
  if (data.descuento > 0) {
    doc.text("1", POS.cantX, y(filaY), { align: "center" });
    doc.text("DESCUENTO", POS.descX, y(filaY));
    doc.text(`-${formatMiles(data.descuento)}`, POS.precioX, y(filaY), { align: "right" });
    doc.text(`-${formatMiles(data.descuento)}`, POS.exentasX, y(filaY), { align: "right" });
  }

  // Total a pagar
  const total = data.subtotalCuota + data.adicionalMonto - data.descuento;
  doc.setFont("helvetica", "bold");
  doc.text(formatMiles(total), POS.totalX, y(POS.totalY), { align: "right" });

  // Liquidación del IVA
  // Cuotas son exentas, adicionales llevan IVA 10%
  const iva10 = data.adicionalMonto > 0 ? Math.round(data.adicionalMonto / 11) : 0;
  doc.setFont("helvetica", "normal");
  doc.text("0", POS.iva5X, y(POS.ivaY), { align: "right" });
  doc.text(formatMiles(iva10), POS.iva10X, y(POS.ivaY), { align: "right" });
  doc.text(formatMiles(iva10), POS.ivaTotalX, y(POS.ivaY), { align: "right" });
}

export function imprimirFactura(data: FacturaData) {
  const doc = new jsPDF("p", "mm", "a4");

  // Original: Cliente (parte superior)
  dibujarFactura(doc, data, COPIA_1_Y);

  // Duplicado: Archivo Tributario (parte inferior)
  dibujarFactura(doc, data, COPIA_2_Y);

  // Abrir en nueva pestaña para imprimir
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  const win = window.open(url, "_blank");
  if (win) {
    win.addEventListener("load", () => {
      win.print();
    });
  }
}
