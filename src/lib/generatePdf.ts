import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type AnyData = Record<string, any>;

const labelMaps: Record<string, Record<string, string>> = {
  doc: { ok: "OK", atrasado: "Atrasado", no: "NO", "": "—" },
  acc: { si: "SÍ", no: "NO", na: "N/A", "": "—" },
  check: { ok: "OK", observacion: "Observación", "": "—" },
};

const fmt = (v: any, kind: "doc" | "acc" | "check" | "text" = "text") => {
  if (kind === "text") return v && String(v).trim() !== "" ? v : "—";
  if (kind === "check" && v && typeof v === "object") {
    return labelMaps.check[v.status ?? ""] ?? "—";
  }
  return labelMaps[kind][v] ?? "—";
};

const prettyKey = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateInspectionPdf(data: AnyData, dictionaries: {
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
  const meta = `Patente: ${data.vehiculo.patente || "—"}  |  Fecha: ${data.inspector.fecha || "—"}  |  Hora: ${data.inspector.hora || "—"}`;
  doc.text(meta, margin, 55);

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

  // Inspeccionado por
  sectionTitle("Inspeccionado por");
  renderTable([
    ["Nombre", fmt(data.inspector.nombre)],
    ["Dirección", fmt(data.inspector.direccion)],
    ["Fecha", fmt(data.inspector.fecha)],
    ["Hora", fmt(data.inspector.hora)],
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
    fmt(data.accesorios.items[key], "acc"),
  ]);
  accRows.push(["Otros", fmt(data.accesorios.otros)]);
  renderTable(accRows);

  // Check sections helper (simple)
  const checkSection = (title: string, items: string[], section: string) => {
    sectionTitle(title);
    renderTable(
      items.map((label) => [label, fmt(data[section]?.[dictionaries.toKey(label)], "check")])
    );
  };

  // Check sections con observación + imagen por campo
  const checkSectionWithExtras = async (title: string, items: string[], section: string) => {
    sectionTitle(title);
    const rows = items.map((label) => {
      const entry = data[section]?.[dictionaries.toKey(label)] ?? {};
      const status = labelMaps.check[entry.status ?? ""] ?? "—";
      const obs = entry.observacion && entry.observacion.trim() !== "" ? entry.observacion : "—";
      const hasImg = entry.imagen ? "Sí" : "No";
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
      .map((label) => ({ label, entry: data[section]?.[dictionaries.toKey(label)] }))
      .filter((x) => x.entry?.imagen);

    if (withImages.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      if (cursorY > pageHeight - 60) { doc.addPage(); cursorY = margin; }
      doc.text(`Imágenes — ${title}`, margin, cursorY + 10);
      cursorY += 18;

      const imgWidth = (pageWidth - margin * 2 - 10) / 2;
      const imgHeight = imgWidth * 0.6;
      for (let i = 0; i < withImages.length; i++) {
        const { label, entry } = withImages[i];
        const col = i % 2;
        const x = margin + col * (imgWidth + 10);
        if (col === 0 && cursorY + imgHeight + 14 > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        try {
          const dataUrl = await loadImageAsDataUrl(entry.imagen.url);
          const fmtType = dataUrl.includes("image/png") ? "PNG" : "JPEG";
          doc.addImage(dataUrl, fmtType, x, cursorY, imgWidth, imgHeight, undefined, "FAST");
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(label, x, cursorY + imgHeight + 10, { maxWidth: imgWidth });
        } catch {
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.text(`No se pudo cargar: ${label}`, x, cursorY + 10);
        }
        if (col === 1 || i === withImages.length - 1) {
          cursorY += imgHeight + 22;
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
    data.observaciones || "—",
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

  const filename = `inspeccion_${data.vehiculo.patente || "sin_patente"}_${data.inspector.fecha || "sin_fecha"}.pdf`;
  doc.save(filename);
}

function loadImageAsDataUrl(url: string): Promise<string> {
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
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}
