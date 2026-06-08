import { useState, type FormEvent, useRef, type ChangeEvent, useEffect } from "react";
import { Car, User, ClipboardCheck, FileDown, Gauge, FileText, Wrench, Cog, Settings, Eye, Armchair, ListChecks, Route, MessageSquare, Save, ArrowLeft, AlertTriangle, CalendarClock, LogOut } from "lucide-react";
import { generateInspectionPdf } from "@/lib/generatePdf";
import logoMService from "@/assets/LOGO_SIN_FONDO.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { getMaintenanceRecommendations, fetchMaintenanceRules, type MaintenanceRule, maintenanceRules } from "@/lib/maintenanceRecommendations";
import { seedMaintenanceRules } from "@/lib/seedFirebase";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { Inspection, DocStatus, AccStatus, CheckStatus } from "@/lib/types";

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
  "Frontal",
  "Costado derecho",
  "Costado izquierdo",
  "Trasera",
  "Techo",
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

const toKey = (label: string) =>
  label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const buildCheckEntryRecord = (items: string[]): Record<string, CheckEntry> =>
  items.reduce((acc, label) => ({ ...acc, [toKey(label)]: { ...emptyCheckEntry } }), {});

const buildSimpleCheckRecord = (items: string[]): Record<string, { estado: CheckStatus }> =>
  items.reduce((acc, label) => ({ ...acc, [toKey(label)]: { estado: "" as CheckStatus } }), {});

const initialData: Inspection = {
  cliente: { nombre: "", rut: "", email: "", telefono: "" },
  inspectorNombre: "",
  inspectorDireccion: "",
  fecha: new Date().toISOString().split("T")[0],
  hora: new Date().toTimeString().slice(0, 5),
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
  equipamiento: {
    items: ACCESORIOS.reduce((acc, { key }) => ({ ...acc, [key]: "" as AccStatus }), {}),
    otros: "",
  },
  detalles: {
    trenMotriz: buildCheckEntryRecord(TREN_MOTRIZ),
    motor: buildCheckEntryRecord(MOTOR_ITEMS),
    exterior: buildCheckEntryRecord(EXTERIOR_ITEMS),
    interior: buildCheckEntryRecord(INTERIOR_ITEMS),
    otros: buildSimpleCheckRecord(OTROS_ITEMS),
    pruebaRuta: buildSimpleCheckRecord(PRUEBA_RUTA_ITEMS),
  },
  observacionesGenerales: "",
  conclusion: "",
  imagenesGenerales: [],
};

const Index = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "edit">("list");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [data, setData] = useState<Inspection>(initialData);
  const [rules, setRules] = useState<MaintenanceRule[]>(maintenanceRules);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await seedMaintenanceRules();
      const rulesData = await fetchMaintenanceRules();
      setRules(rulesData);
    };
    setup();
  }, []);

  const maintenanceRecommendations = getMaintenanceRecommendations({
    marca: data.vehiculo.marca,
    modelo: data.vehiculo.modelo,
    anio: data.vehiculo.anio,
    kilometraje: data.vehiculo.kilometraje
  }, rules);

  const availableBrands = Array.from(new Set(
    rules.flatMap(r => r.appliesTo?.brandIncludes || [])
  )).map(b => b.charAt(0).toUpperCase() + b.slice(1)).sort();

  const searchBrand = data.vehiculo.marca.toLowerCase();
  const availableModels = Array.from(new Set(
    rules.filter(r => {
      if (!searchBrand) return true;
      return r.appliesTo?.brandIncludes?.some(b => b.toLowerCase().includes(searchBrand));
    }).flatMap(r => r.appliesTo?.modelIncludes || [])
  )).map(m => m.charAt(0).toUpperCase() + m.slice(1)).sort();

  const handleNew = () => {
    setCurrentId(newId());
    setData(initialData);
    setView("edit");
  };

  const handleOpen = async (id: string) => {
    setLoading(true);
    const stored = await getInspection(id);
    if (!stored) {
      toast({ title: "Inspección no encontrada" });
      setLoading(false);
      return;
    }
    // Migrar inspecciones antiguas que no tienen inspectorUid
    if (!(stored as any).inspectorUid && auth.currentUser?.uid) {
      try {
        await saveInspection(id, stored);
      } catch {
        // ignorar si falla la migración
      }
    }
    setCurrentId(id);
    setData(stored);
    setView("edit");
    setLoading(false);
  };

  const handleBack = () => {
    setView("list");
    setCurrentId(null);
  };

  const handleSave = async () => {
    if (!currentId) return;
    const patente = data.vehiculo.patente.trim();
    if (!patente) {
      toast({
        title: "Patente requerida",
        description: "Ingresa la patente del vehículo para guardar la inspección.",
      });
      return;
    }
    setLoading(true);
    try {
      await saveInspection(currentId, data);
      toast({
        title: "Inspección guardada",
        description: `Se guardó la inspección de ${patente} en la nube.`,
      });
      setView("list");
      setCurrentId(null);
    } catch (e: any) {
      const msg = e?.code === "permission-denied"
        ? "Sin permisos para guardar. Solo el inspector que creó la inspección puede editarla."
        : "Revisa tu conexión e intenta de nuevo.";
      toast({ title: "Error al guardar", description: msg });
    }
    setLoading(false);
  };

  const update = <S extends keyof Inspection>(
    section: S,
    field: string,
    value: any
  ) => {
    setData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
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

  const handleDownload = async (id: string) => {
    const stored = await getInspection(id);
    if (!stored) {
      toast({ title: "Inspección no encontrada" });
      return;
    }
    try {
      await generateInspectionPdf(stored, {
        trenMotriz: TREN_MOTRIZ,
        motor: MOTOR_ITEMS,
        exterior: EXTERIOR_ITEMS,
        interior: INTERIOR_ITEMS,
        otros: OTROS_ITEMS,
        pruebaRuta: PRUEBA_RUTA_ITEMS,
        accesorios: ACCESORIOS,
        toKey,
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error al generar el informe" });
    }
  };

  if (view === "list") {
    return <InspectionsList onNew={handleNew} onOpen={handleOpen} onDownload={handleDownload} onLogout={() => signOut(auth)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[image:var(--gradient-hero)] text-primary-foreground">
        <div className="container max-w-5xl py-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur overflow-hidden"
                style={{ width: "72px", height: "72px" }}>
                <img
                  src={logoMService}
                  alt="M Service"
                  style={{ width: "60px", height: "60px", objectFit: "contain" }}
                />
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
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="gap-2"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </div>
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
                  value={data.inspectorNombre}
                  onChange={(e) => setData(prev => ({ ...prev, inspectorNombre: e.target.value }))}
                  placeholder="Inspector responsable"
                />
              </FormField>
              <FormField label="Dirección" htmlFor="i-dir">
                <Input
                  id="i-dir"
                  value={data.inspectorDireccion}
                  onChange={(e) => setData(prev => ({ ...prev, inspectorDireccion: e.target.value }))}
                  placeholder="Av. Principal 1234"
                />
              </FormField>
              <FormField label="Fecha" htmlFor="i-fecha">
                <Input
                  id="i-fecha"
                  type="date"
                  value={data.fecha}
                  onChange={(e) => setData(prev => ({ ...prev, fecha: e.target.value }))}
                />
              </FormField>
              <FormField label="Hora" htmlFor="i-hora">
                <Input
                  id="i-hora"
                  type="time"
                  value={data.hora}
                  onChange={(e) => setData(prev => ({ ...prev, hora: e.target.value }))}
                />
              </FormField>
            </div>
          </SectionCard>

          {/* Vehículo */}
          <SectionCard
            title="Datos del Vehículo"
            icon={Car}
            description="Especificaciones técnicas e identificación"
            action={
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" className="gap-2 shadow-[var(--shadow-elegant)]">
                    <CalendarClock className="h-4 w-4" />
                    Mantenciones sugeridas
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CalendarClock className="h-5 w-5 text-primary" />
                      Mantenciones Sugeridas
                    </DialogTitle>
                    <DialogDescription>
                      Recomendaciones basadas en {data.vehiculo.marca} {data.vehiculo.modelo} ({data.vehiculo.kilometraje} km)
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    {maintenanceRecommendations.length > 0 ? (
                      <div className="space-y-3">
                        {maintenanceRecommendations.map((recommendation) => (
                          <div
                            key={recommendation.id}
                            className="flex flex-col gap-3 rounded-lg border border-border/70 bg-secondary/20 p-4 md:flex-row md:items-start md:justify-between"
                          >
                            <div className="flex gap-3">
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {recommendation.title}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {recommendation.detail}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Mantención de referencia:{" "}
                                  <span className="font-medium text-foreground">
                                    {recommendation.dueKm.toLocaleString("es-CL")} km
                                  </span>
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={recommendation.priority === "due" ? "destructive" : "secondary"}
                              className="w-fit shrink-0"
                            >
                              {recommendation.priority === "due"
                                ? "Necesita atención"
                                : `Faltan ${recommendation.kmRemaining.toLocaleString("es-CL")} km`}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg border-dashed">
                        <Car className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Ingresa marca, modelo y kilometraje válido para ver recomendaciones.
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            }
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
                <Select
                  value={data.vehiculo.marca}
                  onValueChange={(v) => {
                    update("vehiculo", "marca", v);
                    update("vehiculo", "modelo", ""); // Limpiar modelo al cambiar marca
                  }}
                >
                  <SelectTrigger id="v-marca">
                    <SelectValue placeholder="Seleccionar marca" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom">
                    {availableBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Modelo" htmlFor="v-modelo">
                <Select
                  value={data.vehiculo.modelo}
                  onValueChange={(v) => update("vehiculo", "modelo", v)}
                  disabled={!data.vehiculo.marca}
                >
                  <SelectTrigger id="v-modelo">
                    <SelectValue placeholder={data.vehiculo.marca ? "Seleccionar modelo" : "Primero elija marca"} />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom">
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <SelectContent position="popper" side="bottom">
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
                  <SelectContent position="popper" side="bottom">
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
                  <SelectContent position="popper" side="bottom">
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
                  <SelectContent position="popper" side="bottom">
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
                    value={(data.documentacion as any)[key]}
                    onValueChange={(v) =>
                      update("documentacion", key, v)
                    }
                  >
                    <SelectTrigger id={`d-${key}`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom">
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
                    value={data.equipamiento.items[key]}
                    onValueChange={(v) =>
                      setData((prev) => ({
                        ...prev,
                        equipamiento: {
                          ...prev.equipamiento,
                          items: { ...prev.equipamiento.items, [key]: v as AccStatus },
                        },
                      }))
                    }
                  >
                    <SelectTrigger id={`a-${key}`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom">
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
                  value={data.equipamiento.otros}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      equipamiento: { ...prev.equipamiento, otros: e.target.value },
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
              { title: "Exterior", icon: Eye, items: EXTERIOR_ITEMS, section: "exterior" as const, prefix: "ex" },
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
                  const entry = data.detalles[section][key] ?? emptyCheckEntry;
                  return (
                    <CheckFieldWithImage
                      key={key}
                      id={`${prefix}-${key}`}
                      label={label}
                      value={entry}
                      onChange={(next) =>
                        setData((prev) => ({
                          ...prev,
                          detalles: {
                            ...prev.detalles,
                            [section]: { ...prev.detalles[section], [key]: next }
                          }
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
                        value={data.detalles[section][key]?.estado ?? ""}
                        onValueChange={(v) =>
                          setData((prev) => ({
                            ...prev,
                            detalles: {
                              ...prev.detalles,
                              [section]: { ...prev.detalles[section], [key]: { estado: v as CheckStatus } }
                            }
                          }))
                        }
                      >
                        <SelectTrigger id={`${prefix}-${key}`}>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom">
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
              value={data.observacionesGenerales}
              onChange={(e) =>
                setData((prev) => ({ ...prev, observacionesGenerales: e.target.value }))
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

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setData(initialData)}
              disabled={loading}
            >
              Limpiar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSave}
              className="gap-2"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? "Guardando..." : "Guardar en la nube"}
            </Button>
            <Button type="submit" size="lg" className="gap-2 shadow-[var(--shadow-elegant)]" disabled={loading}>
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