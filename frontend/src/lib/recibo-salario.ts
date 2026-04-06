import jsPDF from "jspdf";
import { formatFecha, formatMiles } from "./format";
import { LOGO_MEMBRETE } from "./logo-membrete";

const MESES = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function numeroALetras(num: number): string {
  const unidades = [
    "",
    "UN",
    "DOS",
    "TRES",
    "CUATRO",
    "CINCO",
    "SEIS",
    "SIETE",
    "OCHO",
    "NUEVE",
  ];
  const decenas = [
    "",
    "DIEZ",
    "VEINTE",
    "TREINTA",
    "CUARENTA",
    "CINCUENTA",
    "SESENTA",
    "SETENTA",
    "OCHENTA",
    "NOVENTA",
  ];
  const especiales: Record<number, string> = {
    11: "ONCE",
    12: "DOCE",
    13: "TRECE",
    14: "CATORCE",
    15: "QUINCE",
    16: "DIECISEIS",
    17: "DIECISIETE",
    18: "DIECIOCHO",
    19: "DIECINUEVE",
    21: "VEINTIUN",
    22: "VEINTIDOS",
    23: "VEINTITRES",
    24: "VEINTICUATRO",
    25: "VEINTICINCO",
    26: "VEINTISEIS",
    27: "VEINTISIETE",
    28: "VEINTIOCHO",
    29: "VEINTINUEVE",
  };
  const centenas = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ];

  if (num === 0) return "CERO";
  if (num === 100) return "CIEN";

  let resultado = "";

  if (num >= 1000000) {
    const millones = Math.floor(num / 1000000);
    if (millones === 1) resultado += "UN MILLON ";
    else
      resultado +=
        convertirGrupo(millones, unidades, decenas, especiales, centenas) +
        " MILLONES ";
    num %= 1000000;
  }

  if (num >= 1000) {
    const miles = Math.floor(num / 1000);
    if (miles === 1) resultado += "MIL ";
    else
      resultado +=
        convertirGrupo(miles, unidades, decenas, especiales, centenas) +
        " MIL ";
    num %= 1000;
  }

  if (num > 0) {
    resultado += convertirGrupo(num, unidades, decenas, especiales, centenas);
  }

  return resultado.trim();
}

function convertirGrupo(
  num: number,
  unidades: string[],
  decenas: string[],
  especiales: Record<number, string>,
  centenas: string[],
): string {
  let resultado = "";
  if (num === 100) return "CIEN";
  if (num >= 100) {
    resultado += centenas[Math.floor(num / 100)] + " ";
    num %= 100;
  }
  if (especiales[num]) {
    resultado += especiales[num];
  } else if (num >= 10) {
    resultado += decenas[Math.floor(num / 10)];
    if (num % 10 > 0) resultado += " Y " + unidades[num % 10];
  } else if (num > 0) {
    resultado += unidades[num];
  }
  return resultado.trim();
}

interface ReciboData {
  nroRecibo: number;
  fecha: string;
  empleadoNombre: string;
  empleadoApellido: string;
  empleadoCI: string;
  mes: number;
  salarioTotal: number;
  descuentos: number;
  saldoCobrar: number;
}

function dibujarRecibo(
  doc: jsPDF,
  data: ReciboData,
  y: number,
  tipo: "Original" | "Duplicado",
) {
  const left = 12;
  const right = 198;
  const boxW = right - left;
  const boxH = 133;
  const reciboCenterX = 170; // centro del recuadro derecho

  // Marco exterior
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(left, y, boxW, boxH);

  // ── Header: imagen del membrete ──
  // Imagen original 1134x347 (ratio 3.27:1), escalar para que ocupe el header
  const imgH = 28;
  const imgW = imgH * (1134 / 347); // ~91mm
  const imgX = left + 2;
  const imgY = y + 2;
  doc.addImage(LOGO_MEMBRETE, "PNG", imgX, imgY, imgW, imgH);

  // ── Recuadro derecho: RECIBO DE SALARIO ──
  doc.setLineWidth(0.4);
  doc.rect(143, y + 3, 54, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("RECIBO DE SALARIO", reciboCenterX, y + 11, { align: "center" });
  doc.setFontSize(8);
  doc.text("R.U.C.: 80083832-7", reciboCenterX, y + 17, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Nro.  ${formatMiles(data.nroRecibo)}`, reciboCenterX, y + 25, { align: "center" });

  // ── Linea separadora ──
  doc.setLineWidth(0.3);
  doc.line(left, y + 34, right, y + 34);

  // ── Datos del recibo ──
  const dataLeft = left + 5;
  let ly = y + 42;
  const lineH = 6.5;
  const gap = 3; // espacio entre label y valor

  doc.setFontSize(9);

  function campo(label: string, valor: string) {
    doc.setFont("helvetica", "bold");
    doc.text(label, dataLeft, ly);
    const labelW = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    doc.text(valor, dataLeft + labelW + gap, ly);
  }

  campo("Fecha:  ", formatFecha(data.fecha));

  ly += lineH;
  campo("Empleador:  ", 'Escuela Nro. 3567 y Colegio Privado "Juan Crisóstomo Centurión" S.R.L.');

  ly += lineH;
  campo("Nombre y Apellido del Empleado:  ", `${data.empleadoNombre} ${data.empleadoApellido}`);

  ly += lineH;
  campo("Cédula de Identidad Nro.:  ", formatMiles(Number(data.empleadoCI) || 0));

  ly += lineH;
  campo("Período de Pago:  ", `Mes de ${MESES[data.mes]}`);

  // ── Tabla de montos ──
  ly += 11;
  const col1 = left + 35;
  const col2 = left + 93;
  const col3 = left + 150;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Total Salario", col1, ly, { align: "center" });
  doc.text("Descuentos/Anticipos", col2, ly, { align: "center" });
  doc.text("Saldo a Cobrar", col3, ly, { align: "center" });

  doc.setLineWidth(0.2);
  doc.line(left + 5, ly + 2, right - 5, ly + 2);

  ly += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(formatMiles(data.salarioTotal), col1, ly, { align: "center" });
  doc.text(formatMiles(data.descuentos), col2, ly, { align: "center" });
  doc.text(formatMiles(data.saldoCobrar), col3, ly, { align: "center" });

  // Son guaranies
  ly += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const centerPage = left + boxW / 2;
  doc.text(`Son guaraníes: ${numeroALetras(data.saldoCobrar)}`, centerPage, ly, { align: "center" });

  // ── Firmas ──
  // Posicionar las dos firmas dentro del marco con márgenes seguros
  const firmaLineW = 60;
  const firmaLeftX1 = left + 15;
  const firmaLeftX2 = firmaLeftX1 + firmaLineW;
  const firmaLeftCenter = firmaLeftX1 + firmaLineW / 2;
  const firmaRightX1 = right - 15 - firmaLineW;
  const firmaRightX2 = right - 15;
  const firmaRightCenter = firmaRightX1 + firmaLineW / 2;

  ly += 14;
  doc.setLineWidth(0.3);
  doc.line(firmaLeftX1, ly, firmaLeftX2, ly);
  doc.line(firmaRightX1, ly, firmaRightX2, ly);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Firma", firmaLeftCenter, ly + 5, { align: "center" });
  doc.text("Firma Empleador", firmaRightCenter, ly + 5, { align: "center" });

  doc.text("C.I.Nro. ...........................", firmaLeftX1, ly + 11);
  doc.text("Autorizado por la Institución", firmaRightCenter, ly + 11, { align: "center" });

  // Tipo (Original / Duplicado)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  if (tipo === "Original") {
    doc.setTextColor(255, 0, 0);
  } else {
    doc.setTextColor(0, 0, 255);
  }
  doc.text(tipo, firmaRightCenter, ly + 17, { align: "center" });
  doc.setTextColor(0, 0, 0);
}

export function generarReciboSalario(data: ReciboData) {
  const doc = new jsPDF("p", "mm", "a4");

  // Original (parte superior)
  dibujarRecibo(doc, data, 10, "Original");

  // Duplicado (parte inferior)
  dibujarRecibo(doc, data, 148, "Duplicado");

  doc.save(`Recibo_Salario_${data.nroRecibo}.pdf`);
}
