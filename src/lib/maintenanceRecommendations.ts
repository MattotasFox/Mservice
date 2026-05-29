export type MaintenancePriority = "due" | "upcoming";

export interface VehicleLookup {
  marca: string;
  modelo: string;
  anio: string;
  kilometraje: string;
}

interface MaintenanceRule {
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
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const toNumber = (value: string) => Number(value.replace(/\./g, "").replace(",", "."));

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
    title: "Revisar bujias",
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
    detail: "Validar viscosidad y filtro segun manual del fabricante.",
    intervalKm: 10000,
  },
  {
    id: "general-air-filter",
    title: "Revisar filtro de aire",
    detail: "Cambiar si esta saturado o si el auto circula en zonas con polvo.",
    intervalKm: 20000,
  },
  {
    id: "general-brake-fluid",
    title: "Revisar liquido de frenos",
    detail: "Controlar nivel, humedad del liquido y posibles fugas.",
    intervalKm: 40000,
  },
  {
    id: "general-coolant",
    title: "Revisar refrigerante",
    detail: "Controlar nivel, color, fugas y estado de mangueras.",
    intervalKm: 30000,
  },
];

const appliesToVehicle = (rule: MaintenanceRule, vehicle: VehicleLookup) => {
  if (!rule.appliesTo) return true;

  const brand = normalizeText(vehicle.marca);
  const model = normalizeText(vehicle.modelo);
  const year = Number(vehicle.anio);
  const { brandIncludes, modelIncludes, yearFrom, yearTo } = rule.appliesTo;

  const brandMatches =
    !brandIncludes?.length || brandIncludes.some((value) => brand.includes(value));
  const modelMatches =
    !modelIncludes?.length || modelIncludes.some((value) => model.includes(value));
  const yearMatches =
    !year || ((!yearFrom || year >= yearFrom) && (!yearTo || year <= yearTo));

  return brandMatches && modelMatches && yearMatches;
};

const nextDueFor = (km: number, rule: MaintenanceRule) => {
  const firstDueKm = rule.firstDueKm ?? rule.intervalKm;
  if (km <= firstDueKm) return firstDueKm;

  return Math.ceil(km / rule.intervalKm) * rule.intervalKm;
};

export const getMaintenanceRecommendations = (
  vehicle: VehicleLookup
): MaintenanceRecommendation[] => {
  const km = toNumber(vehicle.kilometraje);
  if (!Number.isFinite(km) || km <= 0) return [];

  const matchingRules = maintenanceRules.filter((rule) => appliesToVehicle(rule, vehicle));
  const specificRules = matchingRules.filter((rule) => rule.appliesTo);
  const generalRules = matchingRules.filter(
    (rule) =>
      !rule.appliesTo &&
      !specificRules.some((specificRule) => specificRule.title === rule.title)
  );

  return [...specificRules, ...generalRules]
    .map((rule) => {
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
    })
    .filter(
      (recommendation) =>
        recommendation.priority === "due" ||
        recommendation.kmRemaining <= UPCOMING_WINDOW_KM
    )
    .sort((a, b) => a.kmRemaining - b.kmRemaining);
};
