import { useState, FormEvent } from "react";
import { Car, User, ClipboardCheck, Save, Gauge, FileText, Wrench } from "lucide-react";
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

type DocStatus = "" | "ok" | "atrasado" | "no";
type AccStatus = "" | "si" | "no" | "na";

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
};

const Index = () => {
  const [data, setData] = useState<InspectionData>(initialData);

  const update = <S extends keyof InspectionData>(
    section: S,
    field: keyof InspectionData[S],
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast({
      title: "Inspección guardada",
      description: `Vehículo ${data.vehiculo.patente || "sin patente"} registrado correctamente.`,
    });
    console.log("Inspección:", data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[image:var(--gradient-hero)] text-primary-foreground">
        <div className="container max-w-5xl py-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur">
              <Gauge className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Inspección de Vehículos</h1>
              <p className="text-primary-foreground/80 mt-1">
                Registro detallado de inspección técnica
              </p>
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
                    value={data.accesorios[key]}
                    onValueChange={(v) =>
                      setData((prev) => ({
                        ...prev,
                        accesorios: { ...prev.accesorios, [key]: v as AccStatus },
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

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setData(initialData)}
            >
              Limpiar
            </Button>
            <Button type="submit" size="lg" className="gap-2 shadow-[var(--shadow-elegant)]">
              <Save className="h-4 w-4" />
              Guardar inspección
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Index;
