import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export type MaintenancePriority = "due" | "upcoming";

export interface VehicleLookup {
  marca: string;
  modelo: string;
  anio: string;
  kilometraje: string;
}

export interface MaintenanceRule {
  id: string;
  title: string;
  detail: string;
  intervalKm: number;
  firstDueKm?: number;
  appliesTo?: {
    brandIncludes?: string[];
    modelIncludes?: string[];
    yearFrom?: number;
    yearTo?: number;
  };
  milestones?: {
    km: number;
    title: string;
    detail: string;
  }[];
}

export interface MaintenanceRecommendation {
  id: string;
  title: string;
  detail: string;
  dueKm: number;
  kmRemaining: number;
  priority: MaintenancePriority;
}

const KM_TOLERANCE = 500;
const UPCOMING_WINDOW_KM = 10000; // Aumentado de 5000 a 10000

const normalizeText = (value: string) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const toNumber = (value: string) => {
  if (typeof value !== "string") return NaN;
  return Number(value.replace(/\./g, "").replace(",", "."));
};

// --- LISTA EXTENSA DE REGLAS BASADA EN TU SOLICITUD ---
export const maintenanceRules: MaintenanceRule[] = [
  // CHEVROLET
  {
    id: "ch-corsa",
    title: "Pauta Chevrolet Corsa",
    detail: "Mantenimiento preventivo Corsa",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["chevrolet"], modelIncludes: ["corsa"] },
    milestones: [
      { km: 5000, title: "Cambio de aceite y filtro", detail: "Servicio inicial" },
      { km: 10000, title: "Rotación de neumáticos", detail: "Revisión de balanceo" },
      { km: 20000, title: "Cambio filtro de aire", detail: "Filtro de motor" },
      { km: 30000, title: "Cambio bujías", detail: "Encendido" },
      { km: 40000, title: "Cambio líquido de frenos", detail: "Seguridad" },
    ]
  },
  {
    id: "ch-sail",
    title: "Pauta Chevrolet Sail",
    detail: "Mantenimiento Sail",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["chevrolet"], modelIncludes: ["sail"] },
    milestones: [
      { km: 10000, title: "Aceite motor, filtro y rotación", detail: "Servicio estándar" },
      { km: 20000, title: "Filtros (aire, combustible) y aceite caja", detail: "Transmisión manual" },
      { km: 50000, title: "Líquido frenos y dirección", detail: "Hidráulica" },
    ]
  },
  {
    id: "ch-spark",
    title: "Pauta Chevrolet Spark",
    detail: "Mantenimiento Spark",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["chevrolet"], modelIncludes: ["spark"] },
    milestones: [
      { km: 10000, title: "Cambio de aceite y filtro", detail: "Básico" },
      { km: 50000, title: "Correa accesorios y refrigerante", detail: "Preventivo" },
    ]
  },
  // TOYOTA
  {
    id: "ty-corolla",
    title: "Pauta Toyota Corolla",
    detail: "Mantenimiento Corolla",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["toyota"], modelIncludes: ["corolla"] },
    milestones: [
      { km: 5000, title: "Cambio de aceite y filtro", detail: "Filtro genuino" },
      { km: 30000, title: "Filtro de combustible", detail: "Sistema inyección" },
      { km: 80000, title: "Cambio amortiguadores", detail: "Suspensión" },
    ]
  },
  {
    id: "ty-hilux",
    title: "Pauta Toyota Hilux",
    detail: "Mantenimiento Hilux",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["toyota"], modelIncludes: ["hilux"] },
    milestones: [
      { km: 5000, title: "Cambio aceite y filtro (Uso severo)", detail: "4x4 / Carga" },
      { km: 40000, title: "Filtros, líquido frenos y aceites diferencial", detail: "Servicio mayor" },
    ]
  },
  {
    id: "ty-yaris",
    title: "Pauta Toyota Yaris",
    detail: "Mantenimiento Yaris",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["toyota"], modelIncludes: ["yaris"] },
    milestones: [
      { km: 10000, title: "Aceite motor, filtro y revisión niveles", detail: "Estándar" },
      { km: 40000, title: "Servicio mayor: aire, polen y bujías", detail: "Completo" },
    ]
  },
  // HYUNDAI
  {
    id: "hy-accent",
    title: "Pauta Hyundai Accent",
    detail: "Mantenimiento Accent",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["hyundai"], modelIncludes: ["accent"] },
    milestones: [
      { km: 5000, title: "Cambio de aceite", detail: "Básico" },
      { km: 60000, title: "Cambio correa distribución", detail: "Vital" },
    ]
  },
  {
    id: "hy-tucson",
    title: "Pauta Hyundai Tucson",
    detail: "Mantenimiento Tucson",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["hyundai"], modelIncludes: ["tucson"] },
    milestones: [{ km: 10000, title: "Aceite sintético, filtro y scanner GDS", detail: "Full" }]
  },
  {
    id: "hy-i10",
    title: "Pauta Hyundai i10",
    detail: "Mantenimiento i10",
    intervalKm: 15000,
    appliesTo: { brandIncludes: ["hyundai"], modelIncludes: ["i10"] },
    milestones: [{ km: 15000, title: "Aceite, filtro y escaneo GDS", detail: "Largo intervalo" }]
  },
  // KIA
  {
    id: "ki-rio",
    title: "Pauta Kia Rio",
    detail: "Mantenimiento Rio",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["kia"], modelIncludes: ["rio"] },
    milestones: [{ km: 5000, title: "Cambio de aceite", detail: "Básico" }]
  },
  {
    id: "ki-morning",
    title: "Pauta Kia Morning",
    detail: "Mantenimiento Morning",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["kia"], modelIncludes: ["morning"] },
    milestones: [{ km: 10000, title: "Aceite, filtro y scanner", detail: "Estándar" }]
  },
  {
    id: "ki-sportage",
    title: "Pauta Kia Sportage",
    detail: "Mantenimiento Sportage",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["kia"], modelIncludes: ["sportage"] },
    milestones: [{ km: 10000, title: "Aceite motor y revisión frenos", detail: "Seguridad" }]
  },
  // NISSAN
  {
    id: "ni-sentra",
    title: "Pauta Nissan Sentra",
    detail: "Mantenimiento Sentra",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["nissan"], modelIncludes: ["sentra"] },
    milestones: [
      { km: 5000, title: "Cambio aceite motor", detail: "Básico" },
      { km: 90000, title: "Cambio kit distribución", detail: "Mayor" },
    ]
  },
  {
    id: "ni-versa",
    title: "Pauta Nissan Versa",
    detail: "Mantenimiento Versa",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["nissan"], modelIncludes: ["versa"] },
    milestones: [{ km: 10000, title: "Aceite, filtro y rotación llantas", detail: "Básico" }]
  },
  {
    id: "ni-kicks",
    title: "Pauta Nissan Kicks",
    detail: "Mantenimiento Kicks",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["nissan"], modelIncludes: ["kicks"] },
    milestones: [{ km: 10000, title: "Aceite, filtro y rotación neumáticos", detail: "Básico" }]
  },
  // MAZDA
  {
    id: "mz-3",
    title: "Pauta Mazda 3",
    detail: "Mantenimiento Mazda 3",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["mazda"], modelIncludes: ["3"] },
    milestones: [{ km: 5000, title: "Cambio aceite sintético", detail: "Premium" }]
  },
  {
    id: "mz-cx5",
    title: "Pauta Mazda CX-5",
    detail: "Mantenimiento CX-5",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["mazda"], modelIncludes: ["cx-5"] },
    milestones: [{ km: 10000, title: "Aceite, filtro y niveles", detail: "Skyactiv" }]
  },
  // FORD
  {
    id: "fo-fiesta",
    title: "Pauta Ford Fiesta",
    detail: "Mantenimiento Fiesta",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["ford"], modelIncludes: ["fiesta"] },
    milestones: [
      { km: 5000, title: "Cambio aceite", detail: "Básico" },
      { km: 70000, title: "Cambio embrague", detail: "Transmisión" },
    ]
  },
  {
    id: "fo-ranger",
    title: "Pauta Ford Ranger",
    detail: "Mantenimiento Ranger",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["ford"], modelIncludes: ["ranger"] },
    milestones: [{ km: 10000, title: "Aceite motor y revisión 4x4", detail: "Pickup" }]
  },
  // VOLKSWAGEN
  {
    id: "vw-gol",
    title: "Pauta VW Gol",
    detail: "Mantenimiento Gol",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["volkswagen"], modelIncludes: ["gol"] },
    milestones: [
      { km: 5000, title: "Cambio aceite y filtro", detail: "Básico" },
      { km: 60000, title: "Cambio correa distribución", detail: "Vital" },
    ]
  },
  {
    id: "vw-amarok",
    title: "Pauta VW Amarok",
    detail: "Mantenimiento Amarok",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["volkswagen"], modelIncludes: ["amarok"] },
    milestones: [{ km: 10000, title: "Aceite motor y filtro combustible (TDI)", detail: "Diesel" }]
  },
  // PEUGEOT
  {
    id: "pe-208",
    title: "Pauta Peugeot 208",
    detail: "Mantenimiento 208",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["peugeot"], modelIncludes: ["208"] },
    milestones: [{ km: 5000, title: "Cambio aceite sintético", detail: "Euro 6" }]
  },
  {
    id: "pe-3008",
    title: "Pauta Peugeot 3008",
    detail: "Mantenimiento 3008",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["peugeot"], modelIncludes: ["3008"] },
    milestones: [{ km: 10000, title: "Aceite motor y filtro polen", detail: "Filtro cabina" }]
  },
  {
    id: "pe-partner",
    title: "Pauta Peugeot Partner",
    detail: "Mantenimiento Partner",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["peugeot"], modelIncludes: ["partner"] },
    milestones: [{ km: 10000, title: "Aceite motor y revisión carga", detail: "Comercial" }]
  },
  // SUZUKI
  {
    id: "sz-swift",
    title: "Pauta Suzuki Swift",
    detail: "Mantenimiento Swift",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["suzuki"], modelIncludes: ["swift"] },
    milestones: [{ km: 5000, title: "Cambio aceite", detail: "Básico" }]
  },
  {
    id: "sz-baleno",
    title: "Pauta Suzuki Baleno",
    detail: "Mantenimiento Baleno",
    intervalKm: 10000,
    appliesTo: { brandIncludes: ["suzuki"], modelIncludes: ["baleno"] },
    milestones: [{ km: 10000, title: "Aceite, filtro y rotación neumáticos", detail: "Básico" }]
  },
  // TESLA
  {
    id: "ts-m3",
    title: "Pauta Tesla Model 3",
    detail: "Mantenimiento Eléctrico",
    intervalKm: 20000,
    appliesTo: { brandIncludes: ["tesla"], modelIncludes: ["model 3"] },
    milestones: [
      { km: 10000, title: "Revisión software y batería", detail: "Diagnóstico" },
      { km: 100000, title: "Revisión batería principal", detail: "Garantía" },
    ]
  },
  // FERRARI
  {
    id: "fe-f40",
    title: "Pauta Ferrari F40",
    detail: "Mantenimiento Supercar",
    intervalKm: 5000,
    appliesTo: { brandIncludes: ["ferrari"], modelIncludes: ["f40"] },
    milestones: [
      { km: 5000, title: "Cambio aceite sintético 10W60 y filtro", detail: "Alto rendimiento" },
      { km: 10000, title: "Reemplazo de correas de distribución", detail: "Crítico" },
    ]
  },
  // --- REGLAS GENERALES ---
  {
    id: "general-oil",
    title: "Cambio de aceite de motor",
    detail: "Validar viscosidad según manual.",
    intervalKm: 10000,
  },
];

export const fetchMaintenanceRules = async (): Promise<MaintenanceRule[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "maintenanceRules"));
    const rules: MaintenanceRule[] = [];
    querySnapshot.forEach((doc) => {
      rules.push({ id: doc.id, ...doc.data() } as MaintenanceRule);
    });
    return rules.length > 0 ? rules : maintenanceRules;
  } catch (error) {
    return maintenanceRules;
  }
};

const appliesToVehicle = (rule: MaintenanceRule, vehicle: VehicleLookup) => {
  if (!rule.appliesTo) return true;

  const brand = normalizeText(vehicle.marca);
  const model = normalizeText(vehicle.modelo);
  const { brandIncludes, modelIncludes } = rule.appliesTo;

  const brandMatches = !brandIncludes?.length || brandIncludes.some((value) => brand.includes(normalizeText(value)));
  const modelMatches = !modelIncludes?.length || modelIncludes.some((value) => model.includes(normalizeText(value)));

  return brandMatches && modelMatches;
};

const nextDueFor = (km: number, rule: MaintenanceRule) => {
  const firstDueKm = rule.firstDueKm ?? rule.intervalKm;
  const interval = rule.intervalKm;
  if (km <= firstDueKm + KM_TOLERANCE) return firstDueKm;
  const n = Math.floor((km - firstDueKm + KM_TOLERANCE) / interval);
  const currentOrPastDue = firstDueKm + n * interval;
  return km > currentOrPastDue + KM_TOLERANCE ? currentOrPastDue + interval : currentOrPastDue;
};

export const getMaintenanceRecommendations = (
  vehicle: VehicleLookup,
  rules: MaintenanceRule[] = maintenanceRules
): MaintenanceRecommendation[] => {
  const km = toNumber(vehicle.kilometraje);
  if (!Number.isFinite(km) || km <= 0) return [];

  const expandedRules: MaintenanceRule[] = rules.flatMap((rule) => {
    if (rule.milestones && rule.milestones.length > 0) {
      return rule.milestones.map((m) => ({
        ...rule,
        id: `${rule.id}-${m.km}`,
        title: m.title,
        detail: m.detail,
        intervalKm: m.km,
        milestones: undefined,
      }));
    }
    return [rule];
  });

  const matchingRules = expandedRules.filter((rule) => appliesToVehicle(rule, vehicle));
  const seenTitles = new Set<string>();

  return matchingRules
    .map((rule) => {
      const dueKm = nextDueFor(km, rule);
      const kmRemaining = dueKm - km;
      return {
        id: rule.id,
        title: rule.title,
        detail: rule.detail,
        dueKm,
        kmRemaining,
        priority: (kmRemaining <= KM_TOLERANCE ? "due" : "upcoming") as MaintenancePriority,
      };
    })
    .filter((rec) => {
      if (seenTitles.has(rec.title)) return false;
      seenTitles.add(rec.title);
      return true;
    })
    .filter((rec) => rec.priority === "due" || rec.kmRemaining <= UPCOMING_WINDOW_KM)
    .sort((a, b) => a.kmRemaining - b.kmRemaining);
};
