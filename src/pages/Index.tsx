import { useState, type FormEvent, useRef, type ChangeEvent } from "react";
import { Car, User, ClipboardCheck, FileDown, Gauge, FileText, Wrench, Cog, Settings, Eye, Armchair, ListChecks, Route, MessageSquare, Images, Upload, X, Save, ArrowLeft } from "lucide-react";
import { generateInspectionPdf } from "@/lib/generatePdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/inspection/SectionCard";
import { FormField } from "@/components/inspection/FormField";
import { InspectionsList } from "@/components/inspection/InspectionsList";
import {
  CheckFieldWithImage,
  emptyCheckEntry,
  type CheckEntry,
} from "@/components/inspection/CheckFieldWithImage";
import { saveInspection, getInspection, newId } from "@/lib/inspectionsStore";

type DocStatus = "" | "ok" | "atrasado" | "no";
type AccStatus = "" | "si" | "no" | "na";
type CheckStatus = "" | "ok" | "observacion";

const buildCheckEntryRecord = (items: string[]): Record<string, CheckEntry> =>
  items.reduce((acc, label) => ({ ...acc, [toKey(label)]: { ...emptyCheckEntry } }), {});

// Migrate old string-based values to CheckEntry shape
const migrateToEntry = (raw: any): CheckEntry => {
  if (!raw) return { ...emptyCheckEntry };
  if (typeof raw === "string") {
    return { status: (raw as CheckEntry["status"]) || "", observacion: "", imagen: null };
  }
  return {
    status: raw.status ?? "",
    observacion: raw.observacion ?? "",
    imagen: raw.imagen ?? null,
  };
};

const TREN_MOTRIZ = [
  "Neumáticos",
  "Llantas",
  "Amortiguadores",
  "Frenos delanteros",
  "Frenos traseros",
  "Líquido de frenos",
  "Revisión fugas líquido de frenos",
  "Caja de dirección",
  "Estado homocinéticas",
];

const MOTOR_ITEMS = [
  "Revisión ruidos de motor - zona de motor",
  "Revisión ruidos caja de cambios",
  "Revisión fugas de aceite",
  "Revisión correa auxiliar/accesorios",
  "Nivel/calidad de aceite motor",
  "Nivel/calidad de aceite líquido refrigerante",
  "Estado de humo en escape",
  "Revisión soporte de motor",
];

const EXTERIOR_ITEMS = [
  "Puerta delantera izquierda",
  "Puerta trasera izquierda",
  "Laterales izquierda",
  "Espejo izquierdo",
  "Puerta delantera derecha",
  "Puerta trasera derecha",
  "Laterales derecho",
  "Espejo derecho",
  "Parachoque trasero",
  "Maletero",
  "Luces traseras",
  "Parachoque delantero",
  "Frontal/capot",
  "Luces delanteras",
  "Techo/sunroof/barras",
  "Antena",
  "Vidrios",
  "Luces complementarias",
  "Insignias/molduras",
  "Pintura",
];

const INTERIOR_ITEMS = [
  "Estado de llaves (control/apertura)",
  "Encendido de motor",
  "Testigos en tablero",
  "Comportamiento en relenti",
  "Pedal de freno",
  "Pedal de aceleración",
  "Pedal embrague",
  "Cierre centralizado",
  "Alzavidrios",
  "Espejos",
  "Grabado de vidrios/espejos",
  "Luces interior",
  "Comandos al volante",
  "Luces/señalizadores",
  "Limpiaparabrisas",
  "Equipo multimedia/radio",
  "Sensores",
  "Cámara de retroceso",
  "Tapiz asientos",
  "Tapiz habitáculo",
  "Ajustes de asientos",
  "Cinturones de seguridad",
  "Estado de guantera",
  "Estado de maletero",
  "Neumático repuesto",
  "Herramientas del auto",
  "Elementos de seguridad",
];

const OTROS_ITEMS = [
  "Resultado del scanner",
  "Funcionamiento de alarma y cierre centralizado",
  "Estado de batería (apagado)",
  "Estado de batería (encendido)",
  "Alternador",
  "Kilometraje verificado",
];

const PRUEBA_RUTA_ITEMS = [
  "Alineación",
  "Comportamiento de caja de cambios",
  "Embrague",
  "Comportamiento/ruidos dirección",
  "Frenos",
  "Temperatura motor",
  "Comportamiento motor (ruidos/potencia)",
  "Testigos en tablero",
  "Velocidad crucero",
  "Comportamiento suspensión",
  "Funcionamiento 4x4",
  "Funcionamiento turbo",
  "Ruidos dentro de habitáculo",
];

const toKey = (label: string) =>
  label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const buildCheckRecord = (items: string[]): Record<string, CheckStatus> =>
  items.reduce((acc, label) => ({ ...acc, [toKey(label)]: "" as CheckStatus }), {});

const ACCESORIOS: { key: string; label: string }[] = [
  { key: "aireAcondicionado", label: "Aire acondicionado" },
  { key: "climatizador", label: "Climatizador" },
  { key: "vidriosElectricos", label: "Vidrios eléctricos" },
  { key: "espejosElectricos", label: "Espejos eléctricos" },
  { key: "cierreCentralizado", label: "Cierre centralizado" },
  { key: "tapizCuero", label: "Tapiz cuero" },
  { key: "radioMultimedia", label: "Radio multimedia" },
  { key: "bluetooth", label: "Bluetooth" },
  { key: "controlCrucero", label: "Control crucero" },
  { key: "volanteAjustable", label: "Volante ajustable" },
  { key: "anclajeIsoFix", label: "Anclaje ISO FIX" },
  { key: "frenosAbs", label: "Frenos ABS" },
  { key: "airbag", label: "Airbag" },
  { key: "controlEstabilidad", label: "Control estabilidad" },
  { key: "controlTraccion", label: "Control tracción" },
  { key: "sensorRetroceso", label: "Sensor de retroceso" },
  { key: "camaraRetroceso", label: "Cámara de retroceso" },
  { key: "duplicadoLlave", label: "Duplicado llave" },
  { key: "antena", label: "Antena" },
  { key: "llaveRueda", label: "Llave de rueda" },
  { key: "herramientas", label: "Herramientas" },
  { key: "ruedaRepuesto", label: "Rueda de repuesto" },
  { key: "kitEmergencia", label: "Kit de emergencia" },
  { key: "manualUsuario", label: "Manual de usuario" },
  { key: "extintor", label: "Extintor" },
];

interface InspectionData {
  cliente: { nombre: string; rut: string; email: string; telefono: string };
  inspector: { nombre: string; direccion: string; fecha: string; hora: string };
  vehiculo: {
    patente: string;
    modelo: string;
    vin: string;
    color: string;
    combustible: string;
    tipoAuto: string;
    marca: string;
    anio: string;
    nMotor: string;
    kilometraje: string;
    transmision: string;
    traccion: string;
  };
  documentacion: {
    permisoCirculacion: DocStatus;
    revisionTecnica: DocStatus;
    seguroObligatorio: DocStatus;
  };
  accesorios: { items: Record<string, AccStatus>; otros: string };
  trenMotriz: Record<string, CheckEntry>;
  motor: Record<string, CheckEntry>;
  exterior: Record<string, CheckStatus>;
  interior: Record<string, CheckEntry>;
  otros: Record<string, CheckStatus>;
  pruebaRuta: Record<string, CheckStatus>;
  observaciones: string;
  conclusion: string;
  imagenes: { name: string; url: string }[];
}

const initialAccesorios: { items: Record<string, AccStatus>; otros: string } = {
  items: ACCESORIOS.reduce(
    (acc, { key }) => ({ ...acc, [key]: "" as AccStatus }),
    {} as Record<string, AccStatus>
  ),
  otros: "",
};

const initialData: InspectionData = {
  cliente: { nombre: "", rut: "", email: "", telefono: "" },
  inspector: {
    nombre: "",
    direccion: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
  },
  vehiculo: {
    patente: "",
    modelo: "",
    vin: "",
    color: "",
    combustible: "",
    tipoAuto: "",
    marca: "",
    anio: "",
    nMotor: "",
    kilometraje: "",
    transmision: "",
    traccion: "",
  },
  documentacion: {
    permisoCirculacion: "",
    revisionTecnica: "",
    seguroObligatorio: "",
  },
  accesorios: initialAccesorios,
  trenMotriz: buildCheckEntryRecord(TREN_MOTRIZ),
  motor: buildCheckEntryRecord(MOTOR_ITEMS),
  exterior: buildCheckRecord(EXTERIOR_ITEMS),
  interior: buildCheckEntryRecord(INTERIOR_ITEMS),
  otros: buildCheckRecord(OTROS_ITEMS),
  pruebaRuta: buildCheckRecord(PRUEBA_RUTA_ITEMS),
  observaciones: "",
  conclusion: "",
  imagenes: [],
};

const Index = () => {
  const [view, setView] = useState<"list" | "edit">("list");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [data, setData] = useState<InspectionData>(initialData);

  const handleNew = () => {
    setCurrentId(newId());
    setData(initialData);
    setView("edit");
  };

  const handleOpen = (id: string) => {
    const stored = getInspection(id);
    if (!stored) {
      toast({ title: "Inspección no encontrada" });
      return;
    }
    setCurrentId(id);
    const raw = stored.data as any;
    const migrated: InspectionData = {
      ...(raw as InspectionData),
      trenMotriz: Object.fromEntries(
        TREN_MOTRIZ.map((l) => [toKey(l), migrateToEntry(raw?.trenMotriz?.[toKey(l)])])
      ),
      motor: Object.fromEntries(
        MOTOR_ITEMS.map((l) => [toKey(l), migrateToEntry(raw?.motor?.[toKey(l)])])
      ),
      interior: Object.fromEntries(
        INTERIOR_ITEMS.map((l) => [toKey(l), migrateToEntry(raw?.interior?.[toKey(l)])])
      ),
    };
    setData(migrated);
    setView("edit");
  };

  const handleBack = () => {
    setView("list");
    setCurrentId(null);
  };

  const handleSave = () => {
    if (!currentId) return;
    const patente = data.vehiculo.patente.trim();
    if (!patente) {
      toast({
        title: "Patente requerida",
        description: "Ingresa la patente del vehículo para guardar la inspección.",
      });
      return;
    }
    saveInspection(currentId, patente, data);
    toast({
      title: "Inspección guardada",
      description: `Se guardó la inspección de ${patente}.`,
    });
  };

  const update = <S extends keyof InspectionData>(
    section: S,
    field: keyof InspectionData[S],
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as object), [field]: value },
    }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newImages = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setData((prev) => ({ ...prev, imagenes: [...prev.imagenes, ...newImages] }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await generateInspectionPdf(data, {
        trenMotriz: TREN_MOTRIZ,
        motor: MOTOR_ITEMS,
        exterior: EXTERIOR_ITEMS,
        interior: INTERIOR_ITEMS,
        otros: OTROS_ITEMS,
        pruebaRuta: PRUEBA_RUTA_ITEMS,
        accesorios: ACCESORIOS,
        toKey,
      });
      toast({
        title: "Informe generado",
        description: `PDF descargado para vehículo ${data.vehiculo.patente || "sin patente"}.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error al generar el informe",
        description: "Revisa la consola para más detalles.",
      });
    }
  };

  if (view === "list") {
    return <InspectionsList onNew={handleNew} onOpen={handleOpen} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[image:var(--gradient-hero)] text-primary-foreground">
        <div className="container max-w-5xl py-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur">
                <Gauge className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Inspección de Vehículos</h1>
                <p className="text-primary-foreground/80 mt-1">
                  {data.vehiculo.patente
                    ? `Editando: ${data.vehiculo.patente}`
                    : "Registro detallado de inspección técnica"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <SectionCard title="Cliente" icon={User} description="Información del propietario">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Nombre" htmlFor="c-nombre">
                <Input
                  id="c-nombre"
                  value={data.cliente.nombre}
                  onChange={(e) => update("cliente", "nombre", e.target.value)}
                  placeholder="Juan Pérez"
                />
              </FormField>
              <FormField label="RUT" htmlFor="c-rut">
                <Input
                  id="c-rut"
                  value={data.cliente.rut}
                  onChange={(e) => update("cliente", "rut", e.target.value)}
                  placeholder="12.345.678-9"
                />
              </FormField>
              <FormField label="Email" htmlFor="c-email">
                <Input
                  id="c-email"
                  type="email"
                  value={data.cliente.email}
                  onChange={(e) => update("cliente", "email", e.target.value)}
                  placeholder="cliente@correo.com"
                />
              </FormField>
              <FormField label="Teléfono" htmlFor="c-tel">
                <Input
                  id="c-tel"
                  type="tel"
                  value={data.cliente.telefono}
                  onChange={(e) => update("cliente", "telefono", e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
              </FormField>
            </div>
          </SectionCard>

          {/* Inspeccionado por */}
          <SectionCard
            title="Inspeccionado por"
            icon={ClipboardCheck}
            description="Datos del inspector y la visita"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Nombre" htmlFor="i-nombre">
                <Input
                  id="i-nombre"
                  value={data.inspector.nombre}
                  onChange={(e) => update("inspector", "nombre", e.target.value)}
                  placeholder="Inspector responsable"
                />
              </FormField>
              <FormField label="Dirección" htmlFor="i-dir">
                <Input
                  id="i-dir"
                  value={data.inspector.direccion}
                  onChange={(e) => update("inspector", "direccion", e.target.value)}
                  placeholder="Av. Principal 1234"
                />
              </FormField>
              <FormField label="Fecha" htmlFor="i-fecha">
                <Input
                  id="i-fecha"
                  type="date"
                  value={data.inspector.fecha}
                  onChange={(e) => update("inspector", "fecha", e.target.value)}
                />
              </FormField>
              <FormField label="Hora" htmlFor="i-hora">
                <Input
                  id="i-hora"
                  type="time"
                  value={data.inspector.hora}
                  onChange={(e) => update("inspector", "hora", e.target.value)}
                />
              </FormField>
            </div>
          </SectionCard>

          {/* Vehículo */}
          <SectionCard
            title="Datos del Vehículo"
            icon={Car}
            description="Especificaciones técnicas e identificación"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FormField label="Patente" htmlFor="v-patente">
                <Input
                  id="v-patente"
                  value={data.vehiculo.patente}
                  onChange={(e) =>
                    update("vehiculo", "patente", e.target.value.toUpperCase())
                  }
                  placeholder="ABCD12"
                  className="uppercase font-mono"
                />
              </FormField>
              <FormField label="Marca" htmlFor="v-marca">
                <Input
                  id="v-marca"
                  value={data.vehiculo.marca}
                  onChange={(e) => update("vehiculo", "marca", e.target.value)}
                  placeholder="Toyota"
                />
              </FormField>
              <FormField label="Modelo" htmlFor="v-modelo">
                <Input
                  id="v-modelo"
                  value={data.vehiculo.modelo}
                  onChange={(e) => update("vehiculo", "modelo", e.target.value)}
                  placeholder="Corolla"
                />
              </FormField>
              <FormField label="Año" htmlFor="v-anio">
                <Input
                  id="v-anio"
                  type="number"
                  min="1900"
                  max="2100"
                  value={data.vehiculo.anio}
                  onChange={(e) => update("vehiculo", "anio", e.target.value)}
                  placeholder="2023"
                />
              </FormField>
              <FormField label="Color" htmlFor="v-color">
                <Input
                  id="v-color"
                  value={data.vehiculo.color}
                  onChange={(e) => update("vehiculo", "color", e.target.value)}
                  placeholder="Blanco"
                />
              </FormField>
              <FormField label="VIN" htmlFor="v-vin">
                <Input
                  id="v-vin"
                  value={data.vehiculo.vin}
                  onChange={(e) => update("vehiculo", "vin", e.target.value.toUpperCase())}
                  placeholder="1HGCM82633A123456"
                  className="uppercase font-mono"
                  maxLength={17}
                />
              </FormField>
              <FormField label="N° de Motor" htmlFor="v-motor">
                <Input
                  id="v-motor"
                  value={data.vehiculo.nMotor}
                  onChange={(e) => update("vehiculo", "nMotor", e.target.value)}
                  placeholder="ABC123456"
                />
              </FormField>
              <FormField label="Kilometraje" htmlFor="v-km">
                <Input
                  id="v-km"
                  type="number"
                  min="0"
                  value={data.vehiculo.kilometraje}
                  onChange={(e) => update("vehiculo", "kilometraje", e.target.value)}
                  placeholder="45000"
                />
              </FormField>
              <FormField label="Tipo de combustible" htmlFor="v-comb">
                <Select
                  value={data.vehiculo.combustible}
                  onValueChange={(v) => update("vehiculo", "combustible", v)}
                >
                  <SelectTrigger id="v-comb">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasolina">Gasolina</SelectItem>
                    <SelectItem value="diesel">Diésel</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                    <SelectItem value="electrico">Eléctrico</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Tipo de auto" htmlFor="v-tipo">
                <Select
                  value={data.vehiculo.tipoAuto}
                  onValueChange={(v) => update("vehiculo", "tipoAuto", v)}
                >
                  <SelectTrigger id="v-tipo">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedán</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="coupe">Coupé</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="camion">Camión</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Transmisión" htmlFor="v-trans">
                <Select
                  value={data.vehiculo.transmision}
                  onValueChange={(v) => update("vehiculo", "transmision", v)}
                >
                  <SelectTrigger id="v-trans">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatica">Automática</SelectItem>
                    <SelectItem value="cvt">CVT</SelectItem>
                    <SelectItem value="semi">Semiautomática</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Tracción" htmlFor="v-trac">
                <Select
                  value={data.vehiculo.traccion}
                  onValueChange={(v) => update("vehiculo", "traccion", v)}
                >
                  <SelectTrigger id="v-trac">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fwd">Delantera (FWD)</SelectItem>
                    <SelectItem value="rwd">Trasera (RWD)</SelectItem>
                    <SelectItem value="awd">Total (AWD)</SelectItem>
                    <SelectItem value="4wd">4x4 (4WD)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </SectionCard>

          {/* Documentación del vehículo */}
          <SectionCard
            title="Documentación del Vehículo"
            icon={FileText}
            description="Estado de los documentos legales"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { key: "permisoCirculacion", label: "Permiso de circulación" },
                { key: "revisionTecnica", label: "Revisión técnica" },
                { key: "seguroObligatorio", label: "Seguro obligatorio" },
              ].map(({ key, label }) => (
                <FormField key={key} label={label} htmlFor={`d-${key}`}>
                  <Select
                    value={data.documentacion[key as keyof typeof data.documentacion]}
                    onValueChange={(v) =>
                      update("documentacion", key as keyof typeof data.documentacion, v)
                    }
                  >
                    <SelectTrigger id={`d-${key}`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ok">OK</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                      <SelectItem value="no">NO</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              ))}
            </div>
          </SectionCard>

          {/* Equipamiento / Accesorios */}
          <SectionCard
            title="Equipamiento / Accesorios"
            icon={Wrench}
            description="Estado del equipamiento del vehículo"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ACCESORIOS.map(({ key, label }) => (
                <FormField key={key} label={label} htmlFor={`a-${key}`}>
                  <Select
                    value={data.accesorios.items[key]}
                    onValueChange={(v) =>
                      setData((prev) => ({
                        ...prev,
                        accesorios: {
                          ...prev.accesorios,
                          items: { ...prev.accesorios.items, [key]: v as AccStatus },
                        },
                      }))
                    }
                  >
                    <SelectTrigger id={`a-${key}`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">SI</SelectItem>
                      <SelectItem value="no">NO</SelectItem>
                      <SelectItem value="na">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              ))}
            </div>
            <div className="mt-5">
              <FormField label="Otros" htmlFor="a-otros">
                <Textarea
                  id="a-otros"
                  value={data.accesorios.otros}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      accesorios: { ...prev.accesorios, otros: e.target.value },
                    }))
                  }
                  placeholder="Todo su equipamiento en buen estado"
                  rows={3}
                />
              </FormField>
            </div>
          </SectionCard>

          {/* Secciones con imagen + observación por campo */}
          {(
            [
              { title: "Tren motriz", icon: Cog, items: TREN_MOTRIZ, section: "trenMotriz" as const, prefix: "tm" },
              { title: "Motor", icon: Settings, items: MOTOR_ITEMS, section: "motor" as const, prefix: "mt" },
              { title: "Interior", icon: Armchair, items: INTERIOR_ITEMS, section: "interior" as const, prefix: "in" },
            ]
          ).map(({ title, icon, items, section, prefix }) => (
            <SectionCard
              key={section}
              title={title}
              icon={icon}
              description="Marcar OK u Observación, adjuntar imagen y notas"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {items.map((label) => {
                  const key = toKey(label);
                  const entry = (data[section]?.[key] as CheckEntry) ?? emptyCheckEntry;
                  return (
                    <CheckFieldWithImage
                      key={key}
                      id={`${prefix}-${key}`}
                      label={label}
                      value={entry}
                      onChange={(next) =>
                        setData((prev) => ({
                          ...prev,
                          [section]: { ...prev[section], [key]: next },
                        }))
                      }
                    />
                  );
                })}
              </div>
            </SectionCard>
          ))}

          {/* Secciones simples (solo OK / Observación) */}
          {(
            [
              { title: "Exterior", icon: Eye, items: EXTERIOR_ITEMS, section: "exterior" as const, prefix: "ex" },
              { title: "Otros", icon: ListChecks, items: OTROS_ITEMS, section: "otros" as const, prefix: "ot" },
              { title: "Prueba en ruta", icon: Route, items: PRUEBA_RUTA_ITEMS, section: "pruebaRuta" as const, prefix: "pr" },
            ]
          ).map(({ title, icon, items, section, prefix }) => (
            <SectionCard
              key={section}
              title={title}
              icon={icon}
              description="Marcar OK u Observación"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((label) => {
                  const key = toKey(label);
                  return (
                    <FormField key={key} label={label} htmlFor={`${prefix}-${key}`}>
                      <Select
                        value={(data[section]?.[key] as CheckStatus) ?? ""}
                        onValueChange={(v) =>
                          setData((prev) => ({
                            ...prev,
                            [section]: { ...prev[section], [key]: v as CheckStatus },
                          }))
                        }
                      >
                        <SelectTrigger id={`${prefix}-${key}`}>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ok">OK</SelectItem>
                          <SelectItem value="observacion">Observación</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  );
                })}
              </div>
            </SectionCard>
          ))}

          {/* Observaciones */}
          <SectionCard
            title="Observaciones"
            icon={MessageSquare}
            description="Detalles y observaciones de la inspección"
          >
            <Textarea
              value={data.observaciones}
              onChange={(e) =>
                setData((prev) => ({ ...prev, observaciones: e.target.value }))
              }
              rows={6}
            />
          </SectionCard>

          {/* Conclusión */}
          <SectionCard
            title="Conclusión"
            icon={ClipboardCheck}
            description="Conclusión final de la inspección"
          >
            <Textarea
              value={data.conclusion}
              onChange={(e) =>
                setData((prev) => ({ ...prev, conclusion: e.target.value }))
              }
              rows={5}
            />
          </SectionCard>

          {/* Imágenes de respaldo */}
          <SectionCard
            title="Imágenes de respaldo"
            icon={Images}
            description="Adjuntar fotografías de la inspección"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Subir imágenes
            </Button>
            {data.imagenes.length > 0 && (
              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.imagenes.map((img, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Eliminar imagen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setData(initialData)}
            >
              Limpiar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar inspección
            </Button>
            <Button type="submit" size="lg" className="gap-2 shadow-[var(--shadow-elegant)]">
              <FileDown className="h-4 w-4" />
              Generar informe
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Index;
