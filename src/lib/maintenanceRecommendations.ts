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
const UPCOMING_WINDOW_KM = 5000;

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

const maintenanceRules: MaintenanceRule[] = [
  {
    id: "corsa-oil",
    title: "Cambio de aceite de motor",
    detail: "Usar aceite y filtro compatibles con Chevrolet Corsa.",
    intervalKm: 5000,
    appliesTo: {
      brandIncludes: ["chevrolet", "chevy"],
      modelIncludes: ["corsa"],
      yearFrom: 1994,
      yearTo: 2012,
    },
  },
  {
    id: "corsa-air-filter",
    title: "Revisar o cambiar filtro de aire",
    detail: "Recomendado en uso urbano o caminos con polvo.",
    intervalKm: 10000,
    appliesTo: {
      brandIncludes: ["chevrolet", "chevy"],
      modelIncludes: ["corsa"],
      yearFrom: 1994,
      yearTo: 2012,
    },
  },
  {
    id: "corsa-spark-plugs",
    title: "Revisar bujías",
    detail: "Cambiar si hay desgaste, tirones o consumo elevado.",
    intervalKm: 20000,
    appliesTo: {
      brandIncludes: ["chevrolet", "chevy"],
      modelIncludes: ["corsa"],
      yearFrom: 1994,
      yearTo: 2012,
    },
  },
  {
    id: "general-oil",
    title: "Cambio de aceite de motor",
    detail: "Validar viscosidad y filtro según manual del fabricante.",
    intervalKm: 10000,
  },
  {
    id: "general-air-filter",
    title: "Revisar filtro de aire",
    detail: "Cambiar si está saturado o si el auto circula en zonas con polvo.",
    intervalKm: 20000,
  },
  {
    id: "general-brake-fluid",
    title: "Revisar líquido de frenos",
    detail: "Controlar nivel, humedad del líquido y posibles fugas.",
    intervalKm: 40000,
  },
  {
    id: "general-coolant",
    title: "Revisar refrigerante",
    detail: "Controlar nivel, color, fugas y estado de mangueras.",
    intervalKm: 30000,
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
    console.error("Error fetching rules from Firebase:", error);
    return maintenanceRules;
  }
};

const appliesToVehicle = (rule: MaintenanceRule, vehicle: VehicleLookup) => {
  if (!rule.appliesTo) return true;

  const brand = normalizeText(vehicle.marca);
  const model = normalizeText(vehicle.modelo);
  const year = parseInt(vehicle.anio, 10);
  const { brandIncludes, modelIncludes, yearFrom, yearTo } = rule.appliesTo;

  const brandMatches =
    !brandIncludes?.length || brandIncludes.some((value) => brand.includes(normalizeText(value)));
  const modelMatches =
    !modelIncludes?.length || modelIncludes.some((value) => model.includes(normalizeText(value)));
  const yearMatches =
    !year || isNaN(year) || ((!yearFrom || year >= yearFrom) && (!yearTo || year <= yearTo));

  return brandMatches && modelMatches && yearMatches;
};

const nextDueFor = (km: number, rule: MaintenanceRule) => {
  const firstDueKm = rule.firstDueKm ?? rule.intervalKm;
  const interval = rule.intervalKm;

  if (km <= firstDueKm + KM_TOLERANCE) return firstDueKm;

  const n = Math.floor((km - firstDueKm + KM_TOLERANCE) / interval);
  const currentOrPastDue = firstDueKm + n * interval;

  if (km > currentOrPastDue + KM_TOLERANCE) {
    return currentOrPastDue + interval;
  }
  return currentOrPastDue;
};

export const getMaintenanceRecommendations = (
  vehicle: VehicleLookup,
  rules: MaintenanceRule[] = maintenanceRules
): MaintenanceRecommendation[] => {
  const km = toNumber(vehicle.kilometraje);
  if (!Number.isFinite(km) || km <= 0) return [];

  const matchingRules = rules.filter((rule) => appliesToVehicle(rule, vehicle));
  const specificRules = matchingRules.filter((rule) => rule.appliesTo);
  const generalRules = matchingRules.filter(
    (rule) =>
      !rule.appliesTo &&
      !specificRules.some((specificRule) => specificRule.title === rule.title)
  );

  const recommendations = [...specificRules, ...generalRules].map((rule) => {
    const dueKm = nextDueFor(km, rule);
    const kmRemaining = dueKm - km;
    const priority: MaintenancePriority =
      kmRemaining <= KM_TOLERANCE ? "due" : "upcoming";

    return {
      id: rule.id,
      title: rule.title,
      detail: rule.detail,
      dueKm,
      kmRemaining,
      priority,
    };
  });

  // Filter out duplicates by title, prioritizing specific rules
  const seenTitles = new Set<string>();
  return recommendations
    .filter((rec) => {
      if (seenTitles.has(rec.title)) return false;
      seenTitles.add(rec.title);
      return true;
    })
    .filter(
      (recommendation) =>
        recommendation.priority === "due" ||
        recommendation.kmRemaining <= UPCOMING_WINDOW_KM
    )
    .sort((a, b) => a.kmRemaining - b.kmRemaining);
};
