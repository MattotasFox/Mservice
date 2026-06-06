import { DocumentReference, Timestamp } from "firebase/firestore";

export type DocStatus = "ok" | "atrasado" | "no" | "";
export type AccStatus = "si" | "no" | "na" | "";
export type CheckStatus = "ok" | "observacion" | "";

export interface CheckEntry {
  estado: CheckStatus;
  observacion: string;
  imagenUrl?: string;
}

export interface Inspection {
  id?: string;
  // Meta
  creadoEn?: Timestamp | any;
  inspectorNombre: string;
  inspectorDireccion: string;
  fecha: string;
  hora: string;
  inspectorUid?: string;

  // Referencia al cliente
  clienteRef?: DocumentReference | string;
  cliente: {
    nombre: string;
    rut: string;
    email: string;
    telefono: string;
  };

  // Vehículo
  vehiculo: {
    patente: string;
    marca: string;
    modelo: string;
    anio: string;
    color: string;
    vin: string;
    nMotor: string;
    kilometraje: string;
    combustible: string;
    tipoAuto: string;
    transmision: string;
    traccion: string;
  };

  // Documentación
  documentacion: {
    permisoCirculacion: DocStatus;
    revisionTecnica: DocStatus;
    seguroObligatorio: DocStatus;
  };

  // Equipamiento
  equipamiento: {
    items: Record<string, AccStatus>;
    otros: string;
  };

  // Inspecciones detalladas
  detalles: {
    trenMotriz: Record<string, CheckEntry>;
    motor: Record<string, CheckEntry>;
    interior: Record<string, CheckEntry>;
    exterior: Record<string, CheckEntry>;
    otros: Record<string, { estado: CheckStatus }>;
    pruebaRuta: Record<string, { estado: CheckStatus }>;
  };

  // Campos finales
  observacionesGenerales: string;
  conclusion: string;
  imagenesGenerales: string[];
}

export interface Cliente {
  id?: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  creadoEn: Timestamp | any;
  inspeccionesRefs: DocumentReference[];
}

export interface Vehiculo {
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  vin: string;
  propietarioActualRef: DocumentReference;
  historialInspeccionesRefs: DocumentReference[];
  ultimaInspeccion: Timestamp | any;
}
