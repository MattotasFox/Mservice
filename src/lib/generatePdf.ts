import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "@/assets/logo.png";
import { Inspection } from "./types";

const labelMaps: Record<string, Record<string, string>> = {
  doc: { ok: "OK", atrasado: "Atrasado", no: "NO", "": "—" },
  acc: { si: "SÍ", no: "NO", na: "N/A", "": "—" },
  check: { ok: "OK", observacion: "Observación", "": "—" },
};

const fmt = (v: any, kind: "doc" | "acc" | "check" | "text" = "text") => {
  if (kind === "text") return v && String(v).trim() !== "" ? v : "—";
  if (kind === "check" && v && typeof v === "object") {
    return labelMaps.check[v.estado ?? ""] ?? "—";
  }
  return labelMaps[kind][v] ?? "—";
};

export async function generateInspectionPdf(data: Inspection, dictionaries: {
  trenMotriz: string[];
  motor: string[];
  exterior: string[];
  interior: string[];
  otros: string[];
  pruebaRuta: string[];
  accesorios: { key: string; label: string }[];
  toKey: (s: string) => string;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Informe de Inspección Vehicular", margin, 35);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const meta = `Patente: ${data.vehiculo.patente || "—"}  |  Fecha: ${data.fecha || "—"}  |  Hora: ${data.hora || "—"}`;
  doc.text(meta, margin, 55);

  // Logo top-right
  try {
    const logoData = await loadPngAsDataUrl(logoUrl);
    const logoSize = 56;
    doc.addImage(logoData, "PNG", pageWidth - margin - logoSize, 7, logoSize, logoSize, undefined, "FAST");
  } catch {
    // ignore if logo fails
  }

  let cursorY = 90;

  const sectionTitle = (title: string) => {
    if (cursorY > pageHeight - 80) {
      doc.addPage();
      cursorY = margin;
    }
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, cursorY, pageWidth - margin * 2, 22, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 8, cursorY + 15);
    cursorY += 28;
  };

  const renderTable = (rows: [string, string][]) => {
    autoTable(doc, {
      startY: cursorY,
      head: [["Campo", "Valor"]],
      body: rows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { cellWidth: 200, fontStyle: "bold" } },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 14;
  };

  // Cliente
  sectionTitle("Cliente");
  renderTable([
    ["Nombre", fmt(data.cliente.nombre)],
    ["RUT", fmt(data.cliente.rut)],
    ["Email", fmt(data.cliente.email)],
    ["Teléfono", fmt(data.cliente.telefono)],
  ]);

  // Inspector
  sectionTitle("Inspeccionado por");
  renderTable([
    ["Nombre", fmt(data.inspectorNombre)],
    ["Dirección", fmt(data.inspectorDireccion)],
    ["Fecha", fmt(data.fecha)],
    ["Hora", fmt(data.hora)],
  ]);

  // Vehículo
  sectionTitle("Datos del Vehículo");
  renderTable([
    ["Patente", fmt(data.vehiculo.patente)],
    ["Marca", fmt(data.vehiculo.marca)],
    ["Modelo", fmt(data.vehiculo.modelo)],
    ["Año", fmt(data.vehiculo.anio)],
    ["Color", fmt(data.vehiculo.color)],
    ["VIN", fmt(data.vehiculo.vin)],
    ["N° de Motor", fmt(data.vehiculo.nMotor)],
    ["Kilometraje", fmt(data.vehiculo.kilometraje)],
    ["Combustible", fmt(data.vehiculo.combustible)],
    ["Tipo de auto", fmt(data.vehiculo.tipoAuto)],
    ["Transmisión", fmt(data.vehiculo.transmision)],
    ["Tracción", fmt(data.vehiculo.traccion)],
  ]);

  // Documentación
  sectionTitle("Documentación del Vehículo");
  renderTable([
    ["Permiso de circulación", fmt(data.documentacion.permisoCirculacion, "doc")],
    ["Revisión técnica", fmt(data.documentacion.revisionTecnica, "doc")],
    ["Seguro obligatorio", fmt(data.documentacion.seguroObligatorio, "doc")],
  ]);

  // Accesorios
  sectionTitle("Equipamiento / Accesorios");
  const accRows: [string, string][] = dictionaries.accesorios.map(({ key, label }) => [
    label,
    fmt(data.equipamiento.items[key], "acc"),
  ]);
  accRows.push(["Otros", fmt(data.equipamiento.otros)]);
  renderTable(accRows);

  // Check sections helper (simple)
  const checkSection = (title: string, items: string[], section: "otros" | "pruebaRuta") => {
    sectionTitle(title);
    renderTable(
      items.map((label) => {
        const key = dictionaries.toKey(label);
        const entry = data.detalles[section][key];
        return [label, labelMaps.check[entry?.estado ?? ""] ?? "—"];
      })
    );
  };

  // Check sections con observación + imagen por campo
  const checkSectionWithExtras = async (title: string, items: string[], section: "trenMotriz" | "motor" | "exterior" | "interior") => {
    sectionTitle(title);
    const rows = items.map((label) => {
      const key = dictionaries.toKey(label);
      const entry = data.detalles[section][key] ?? {};
      const status = labelMaps.check[entry.estado ?? ""] ?? "—";
      const obs = entry.observacion && entry.observacion.trim() !== "" ? entry.observacion : "—";
      const hasImg = entry.imagenUrl ? "Sí" : "No";
      return [label, status, obs, hasImg];
    });
    autoTable(doc, {
      startY: cursorY,
      head: [["Campo", "Estado", "Observación", "Imagen"]],
      body: rows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 150, fontStyle: "bold" },
        1: { cellWidth: 70 },
        3: { cellWidth: 50 },
      },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 14;

    // Render images attached to fields
    const withImages = items
      .map((label) => ({ label, entry: data.detalles[section][dictionaries.toKey(label)] }))
      .filter((x) => x.entry?.imagenUrl);

    if (withImages.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      if (cursorY > pageHeight - 60) { doc.addPage(); cursorY = margin; }
      doc.text(`Imágenes — ${title}`, margin, cursorY + 10);
      cursorY += 18;

      const cellWidth = (pageWidth - margin * 2 - 10) / 2;
      const maxCellHeight = 220;
      let rowMaxHeight = 0;
      let rowStartY = cursorY;
      for (let i = 0; i < withImages.length; i++) {
        const { label, entry } = withImages[i];
        if (!entry?.imagenUrl) continue;
        const col = i % 2;
        const x = margin + col * (cellWidth + 10);

        try {
          const { dataUrl, width: iw, height: ih } = await loadImageAsDataUrl(entry.imagenUrl);
          const ratio = iw / ih;
          let drawW = cellWidth;
          let drawH = drawW / ratio;
          if (drawH > maxCellHeight) {
            drawH = maxCellHeight;
            drawW = drawH * ratio;
          }
          const cellHeight = drawH + 14;

          if (col === 0) {
            if (cursorY + cellHeight > pageHeight - margin) {
              doc.addPage();
              cursorY = margin;
            }
            rowStartY = cursorY;
            rowMaxHeight = 0;
          }

          const drawX = x + (cellWidth - drawW) / 2;
          const fmtType = dataUrl.includes("image/png") ? "PNG" : "JPEG";
          doc.addImage(dataUrl, fmtType, drawX, rowStartY, drawW, drawH, undefined, "FAST");
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(label, drawX, rowStartY + drawH + 10, { maxWidth: drawW });

          if (cellHeight > rowMaxHeight) rowMaxHeight = cellHeight;
        } catch {
          if (col === 0) {
            rowStartY = cursorY;
            rowMaxHeight = Math.max(rowMaxHeight, 20);
          }
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.text(`No se pudo cargar: ${label}`, x, rowStartY + 10);
        }

        if (col === 1 || i === withImages.length - 1) {
          cursorY = rowStartY + rowMaxHeight + 8;
        }
      }
      cursorY += 6;
    }
  };

  await checkSectionWithExtras("Tren Motriz", dictionaries.trenMotriz, "trenMotriz");
  await checkSectionWithExtras("Motor", dictionaries.motor, "motor");
  await checkSectionWithExtras("Exterior", dictionaries.exterior, "exterior");
  await checkSectionWithExtras("Interior", dictionaries.interior, "interior");
  checkSection("Otros", dictionaries.otros, "otros");
  checkSection("Prueba en Ruta", dictionaries.pruebaRuta, "pruebaRuta");

  // Observaciones
  sectionTitle("Observaciones");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const obsLines = doc.splitTextToSize(
    data.observacionesGenerales || "—",
    pageWidth - margin * 2
  );
  if (cursorY + obsLines.length * 12 > pageHeight - margin) {
    doc.addPage();
    cursorY = margin;
  }
  doc.text(obsLines, margin, cursorY + 10);
  cursorY += obsLines.length * 12 + 14;

  // Conclusión
  sectionTitle("Conclusión");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const concLines = doc.splitTextToSize(
    data.conclusion || "—",
    pageWidth - margin * 2
  );
  if (cursorY + concLines.length * 12 > pageHeight - margin) {
    doc.addPage();
    cursorY = margin;
  }
  doc.text(concLines, margin, cursorY + 10);
  cursorY += concLines.length * 12 + 14;

  // Footer page numbers
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Página ${p} de ${total}`, pageWidth - margin, pageHeight - 15, { align: "right" });
  }

  const filename = `inspeccion_${data.vehiculo.patente || "sin_patente"}_${data.fecha || "sin_fecha"}.pdf`;
  doc.save(filename);
}

function loadImageAsDataUrl(
  url: string
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0);
      try {
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.85),
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

function loadPngAsDataUrl(url: string): Promise<string> {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
}
