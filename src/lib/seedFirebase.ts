import { collection, getDocs, deleteDoc, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";

const rawData = `
Chevrolet	Corsa	2004	5000	Cambio de aceite y filtro
Chevrolet	Corsa	2004	10000	Rotación de neumáticos
Chevrolet	Corsa	2004	20000	Cambio filtro de aire
Chevrolet	Corsa	2004	30000	Cambio bujías
Chevrolet	Corsa	2004	40000	Cambio líquido de frenos
Chevrolet	Sail	2018	10000	Aceite motor, filtro y rotación neumáticos
Chevrolet	Sail	2018	20000	Cambio filtros (aire, combustible) y aceite caja manual
Chevrolet	Sail	2018	30000	Cambio bujías y filtro polen
Chevrolet	Sail	2018	50000	Cambio líquido frenos y dirección hidráulica
Chevrolet	Spark	2015	10000	Cambio de aceite y filtro
Chevrolet	Spark	2015	20000	Rotación neumáticos y revisión frenos
Chevrolet	Spark	2015	50000	Cambio correa accesorios y refrigerante
Toyota	Corolla	2010	5000	Cambio de aceite y filtro
Toyota	Corolla	2010	15000	Alineación y balanceo
Toyota	Corolla	2010	30000	Cambio filtro de combustible
Toyota	Corolla	2010	60000	Cambio correa accesorios
Toyota	Corolla	2010	80000	Cambio amortiguadores
Toyota	Hilux	2022	5000	Cambio aceite y filtro (Uso severo)
Toyota	Hilux	2022	10000	Aceite motor, filtro y rotación neumáticos
Toyota	Hilux	2022	20000	Aceite motor, filtro y revisión de frenos
Toyota	Hilux	2022	40000	Cambio filtros (aire, combustible), líquido frenos y aceites diferencial
Toyota	Yaris	2021	10000	Aceite motor, filtro y revisión de niveles
Toyota	Yaris	2021	40000	Servicio mayor: aire, polen y bujías
Hyundai	Accent	2012	5000	Cambio de aceite
Hyundai	Accent	2012	10000	Revisión frenos
Hyundai	Accent	2012	20000	Cambio filtro aire
Hyundai	Accent	2012	40000	Cambio bujías
Hyundai	Accent	2012	60000	Cambio correa distribución
Hyundai	Tucson	2021	10000	Aceite sintético, filtro y scanner GDS
Hyundai	Tucson	2021	20000	Alineación, balanceo y revisión de frenos
Hyundai	Tucson	2021	40000	Cambio filtros (aire, polen) y revisión transmisión
Hyundai	i10	2019	15000	Aceite motor, filtro y escaneo electrónico GDS
Hyundai	i10	2019	30000	Filtro aire y revisión de seguridad
Kia	Rio	2015	5000	Cambio de aceite
Kia	Rio	2015	10000	Revisión suspensión
Kia	Rio	2015	20000	Cambio filtro aire
Kia	Rio	2015	40000	Cambio líquido transmisión
Kia	Rio	2015	80000	Cambio amortiguadores
Kia	Morning	2019	10000	Aceite motor, filtro y scanner
Kia	Morning	2019	20000	Cambio filtro polen y revisión correas
Kia	Morning	2019	30000	Cambio líquido frenos y filtro aire
Kia	Morning	2019	40000	Cambio filtro combustible y filtro polen
Kia	Sportage	2022	10000	Aceite motor, filtro y revisión de frenos
Kia	Sportage	2022	20000	Rotación neumáticos y filtro polen
Nissan	Sentra	2014	5000	Cambio aceite motor
Nissan	Sentra	2014	15000	Rotación neumáticos
Nissan	Sentra	2014	30000	Cambio bujías
Nissan	Sentra	2014	45000	Cambio líquido frenos
Nissan	Sentra	2014	90000	Cambio kit distribución
Nissan	Versa	2020	10000	Aceite motor, filtro y rotación de llantas
Nissan	Versa	2020	40000	Cambio filtros (aire, cabina) y líquido de frenos
Nissan	Kicks	2021	10000	Aceite motor, filtro y rotación neumáticos
Nissan	Kicks	2021	20000	Limpieza de frenos y filtro polen
Mazda	3	2018	5000	Cambio aceite sintético
Mazda	3	2018	10000	Revisión frenos
Mazda	3	2018	20000	Cambio filtro cabina
Mazda	3	2018	40000	Cambio bujías
Mazda	3	2018	80000	Cambio amortiguadores
Mazda	CX-5	2020	10000	Aceite motor, filtro y revisión niveles
Mazda	CX-5	2020	20000	Filtro aire y rotación neumáticos
Mazda	2	2019	10000	Aceite motor y filtro
Mazda	2	2019	30000	Filtro polen y bujías
Ford	Fiesta	2011	5000	Cambio aceite
Ford	Fiesta	2011	10000	Rotación neumáticos
Ford	Fiesta	2011	20000	Cambio filtro aire
Ford	Fiesta	2011	50000	Cambio líquido dirección
Ford	Fiesta	2011	70000	Cambio embrague
Ford	Ranger	2022	10000	Aceite motor, filtro y revisión 4x4
Ford	Ranger	2022	40000	Cambio filtros y líquidos diferenciales
Ford	EcoSport	2017	10000	Aceite motor y filtro
Ford	EcoSport	2017	30000	Filtro aire y polen
Volkswagen	Gol	2013	5000	Cambio aceite y filtro
Volkswagen	Gol	2013	15000	Alineación y balanceo
Volkswagen	Gol	2013	30000	Cambio bujías
Volkswagen	Gol	2013	60000	Cambio correa distribución
Volkswagen	Gol	2013	90000	Cambio amortiguadores
Volkswagen	Amarok	2021	10000	Aceite motor, filtro y filtro combustible (TDI)
Volkswagen	Amarok	2021	40000	Cambio filtros aire y polen
Volkswagen	Polo	2020	10000	Aceite motor y filtro
Volkswagen	Polo	2020	30000	Bujías y filtro aire
Peugeot	208	2019	5000	Cambio aceite sintético
Peugeot	208	2019	10000	Revisión frenos
Peugeot	208	2019	20000	Cambio filtro aire
Peugeot	208	2019	40000	Cambio bujías
Peugeot	208	2019	60000	Cambio líquido transmisión
Peugeot	3008	2021	10000	Aceite motor y filtro polen
Peugeot	3008	2021	40000	Cambio líquido frenos y filtros
Peugeot	Partner	2020	10000	Aceite motor y revisión carga
Peugeot	Partner	2020	50000	Cambio correas y tensores
Renault	Clio	2008	5000	Cambio aceite
Renault	Clio	2008	10000	Rotación neumáticos
Renault	Clio	2008	20000	Cambio filtro combustible
Renault	Clio	2008	40000	Cambio líquido frenos
Renault	Clio	2008	80000	Cambio kit distribución
Renault	Duster	2021	10000	Aceite motor y filtro
Renault	Duster	2021	40000	Filtros aire, polen y bujías
Renault	Kwid	2022	10000	Aceite motor y revisión niveles
Renault	Kwid	2022	30000	Filtro aire y frenos delanteros
Suzuki	Swift	2017	5000	Cambio aceite
Suzuki	Swift	2017	10000	Revisión suspensión
Suzuki	Swift	2017	20000	Cambio filtro aire
Suzuki	Swift	2017	40000	Cambio bujías
Suzuki	Swift	2017	80000	Cambio amortiguadores
Suzuki	Baleno	2022	10000	Aceite motor, filtro y rotación neumáticos
Suzuki	Baleno	2022	40000	Cambio aceite, filtro aire, bujías y aceite caja manual
Suzuki	Vitara	2021	10000	Aceite motor, filtro y rotación
Suzuki	Vitara	2021	40000	Cambio bujías y líquido frenos
Honda	Civic	2016	5000	Cambio aceite sintético
Honda	Civic	2016	10000	Revisión frenos
Honda	Civic	2016	30000	Cambio filtro aire
Honda	Civic	2016	60000	Cambio líquido transmisión
Honda	Civic	2016	90000	Cambio kit distribución
Honda	CR-V	2019	10000	Aceite motor y filtro
Honda	CR-V	2019	40000	Filtro aire y líquido frenos
Honda	HR-V	2020	10000	Aceite motor y filtro
Honda	HR-V	2020	30000	Filtro aire y polen
Subaru	Impreza	2015	5000	Cambio aceite
Subaru	Impreza	2015	15000	Rotación neumáticos
Subaru	Impreza	2015	30000	Cambio bujías
Subaru	Impreza	2015	60000	Cambio líquido diferencial
Subaru	Impreza	2015	100000	Cambio amortiguadores
Subaru	Forester	2021	15000	Aceite motor, filtro y revisión AWD
Subaru	Forester	2021	30000	Filtro aire y revisión Bóxer
Subaru	XV	2020	15000	Aceite motor y filtro
Subaru	XV	2020	45000	Bujías y filtro polen
Mitsubishi	Lancer	2012	5000	Cambio aceite
Mitsubishi	Lancer	2012	10000	Revisión frenos
Mitsubishi	Lancer	2012	20000	Cambio filtro aire
Mitsubishi	Lancer	2012	40000	Cambio líquido transmisión
Mitsubishi	Lancer	2012	80000	Cambio kit distribución
Mitsubishi	L200	2023	10000	Aceite motor, filtro y limpieza de frenos
Mitsubishi	L200	2023	20000	Aceite motor, filtro y revisión de correas
Mitsubishi	L200	2023	40000	Cambio filtros (aire, polen, combustible) y aceites transmisión
Mitsubishi	Montero	2018	10000	Aceite motor y engrase chasis
Mitsubishi	Montero	2018	40000	Cambio aceites caja y transferencia
Audi	A3	2019	5000	Cambio aceite premium
Audi	A3	2019	10000	Revisión electrónica
Audi	A3	2019	30000	Cambio filtro cabina
Audi	A3	2019	60000	Cambio DSG
Audi	A3	2019	90000	Cambio suspensión
Audi	Q3	2021	15000	Aceite motor y filtro (Audi Care)
Audi	Q3	2021	45000	Filtro aire y bujías
Audi	A4	2020	15000	Aceite motor y filtro
Audi	A4	2020	60000	Cambio aceite transmisión S-Tronic
BMW	Serie 3	2018	5000	Cambio aceite sintético
BMW	Serie 3	2018	10000	Revisión frenos
BMW	Serie 3	2018	30000	Cambio filtro aire
BMW	Serie 3	2018	60000	Cambio líquido transmisión
BMW	Serie 3	2018	100000	Cambio suspensión
BMW	X1	2021	10000	Aceite motor y revisión CBS
BMW	X1	2021	40000	Filtro aire y líquido frenos
BMW	Serie 1	2020	10000	Aceite motor y filtro
BMW	Serie 1	2020	30000	Bujías y filtro polen
Mercedes-Benz	Clase C	2020	5000	Cambio aceite premium
Mercedes-Benz	Clase C	2020	15000	Revisión frenos
Mercedes-Benz	Clase C	2020	30000	Cambio filtro cabina
Mercedes-Benz	Clase C	2020	60000	Cambio transmisión automática
Mercedes-Benz	Clase C	2020	100000	Cambio amortiguadores
Mercedes-Benz	GLC	2021	10000	Aceite motor y filtro
Mercedes-Benz	GLC	2021	40000	Cambio líquido frenos y filtros
Mercedes-Benz	Clase A	2019	10000	Aceite motor y filtro
Mercedes-Benz	Clase A	2019	30000	Filtro aire y polen
Fiat	Palio	2009	5000	Cambio aceite
Fiat	Palio	2009	10000	Rotación neumáticos
Fiat	Palio	2009	20000	Cambio filtro aire
Fiat	Palio	2009	40000	Cambio bujías
Fiat	Palio	2009	70000	Cambio embrague
Fiat	Strada	2021	10000	Aceite motor y filtro
Fiat	Strada	2021	40000	Bujías y filtro aire
Fiat	Cronos	2020	10000	Aceite motor y filtro
Fiat	Cronos	2020	30000	Filtro polen y revisión frenos
Jeep	Compass	2021	5000	Cambio aceite sintético
Jeep	Compass	2021	10000	Revisión tracción
Jeep	Compass	2021	30000	Cambio filtro aire
Jeep	Compass	2021	60000	Cambio líquido transmisión
Jeep	Compass	2021	90000	Cambio suspensión
Jeep	Renegade	2020	10000	Aceite motor y filtro Mopar
Jeep	Renegade	2020	40000	Filtro aire y líquido frenos
Jeep	Grand Cherokee	2019	10000	Aceite motor y filtro
Jeep	Grand Cherokee	2019	50000	Aceite diferenciales y transferencia
Tesla	Model 3	2022	10000	Revisión software y batería
Tesla	Model 3	2022	20000	Rotación neumáticos
Tesla	Model 3	2022	40000	Cambio filtro cabina
Tesla	Model 3	2022	60000	Revisión sistema frenos
Tesla	Model 3	2022	100000	Revisión batería principal
Tesla	Model Y	2023	10000	Rotación neumáticos
Tesla	Model Y	2023	20000	Filtro cabina y revisión gomas
Tesla	Model S	2021	10000	Rotación neumáticos
Tesla	Model S	2021	50000	Prueba humedad líquido frenos
Volvo	XC60	2020	5000	Cambio aceite
Volvo	XC60	2020	15000	Revisión frenos
Volvo	XC60	2020	30000	Cambio filtro aire
Volvo	XC60	2020	60000	Cambio líquido transmisión
Volvo	XC60	2020	100000	Cambio suspensión
Volvo	XC40	2021	10000	Aceite motor y actualización software
Volvo	XC40	2021	40000	Filtro aire y líquido frenos
Volvo	XC90	2019	10000	Aceite motor y filtro
Volvo	XC90	2019	50000	Revisión sistema AWD y filtros
MG	3	2021	5000	Revisión de cortesía y niveles
MG	3	2021	10000	Aceite motor, filtro y scanner oficial
MG	3	2021	20000	Cambio filtro aire y filtro polen
MG	3	2021	40000	Cambio aceite, todos los filtros, líquido frenos y bujías
Ford	Mustang	2020	5000	Aceite sintético Premium 5W20 y filtro
Ford	Mustang	2020	15000	Rotación neumáticos y alineación
Ford	Mustang	2020	30000	Filtros aire alto rendimiento y bujías
Ford	Mustang	2020	60000	Líquido transmisión y revisión frenos
MG	ZS	2022	10000	Aceite motor y filtro
MG	ZS	2022	30000	Filtro aire y revisión niveles
MG	RX5	2021	10000	Aceite motor y filtro
MG	RX5	2021	40000	Líquido frenos y bujías
Chery	Tiggo 2	2022	5000	Mantenimiento preventivo inicial (aceite y filtro)
Chery	Tiggo 2	2022	10000	Aceite motor, filtro y rotación neumáticos
Chery	Tiggo 2	2022	30000	Cambio líquido transmisión y dirección
Chery	Tiggo 2	2022	40000	Cambio aceite, filtro aire, polen y líquido frenos
Chery	Tiggo 3	2021	10000	Aceite motor y filtro
Chery	Tiggo 3	2021	40000	Filtro aire y polen
Chery	Tiggo 7	2022	10000	Aceite motor y filtro
Chery	Tiggo 7	2022	30000	Revisión transmisión y niveles
Great Wall	Poer	2022	10000	Aceite motor, filtro y rotación neumáticos
Great Wall	Poer	2022	20000	Cambio filtros (aire, combustible diésel) y limpieza inyectores
Great Wall	Poer	2022	40000	Aceite motor, filtro, aceites caja/diferencial y líquido frenos
Great Wall	Wingle 7	2021	10000	Aceite motor y filtro
Great Wall	Wingle 7	2021	30000	Filtro combustible y aire
Great Wall	Haval H6	2022	10000	Aceite motor y filtro
Great Wall	Haval H6	2022	40000	Líquido frenos y filtros
Mahindra	Scorpio	2015	10000	Aceite motor (5W30), filtro y engrase cardán
Mahindra	Scorpio	2015	20000	Cambio filtro aire y rotación neumáticos
Mahindra	Scorpio	2015	30000	Cambio filtro combustible y revisión niveles
Mahindra	Scorpio	2015	40000	Cambio líquido frenos y filtro aire
Mahindra	Scorpio	2015	50000	Cambio aceite caja de cambios y revisión frenos traseros
Mahindra	Pik Up	2020	10000	Aceite motor y filtro
Mahindra	Pik Up	2020	20000	Revisión válvula PCV y filtros
Mahindra	XUV500	2019	10000	Aceite motor y filtro
Mahindra	XUV500	2019	40000	Filtro aire y líquido frenos
Ferrari	F40	1987	5000	Cambio de aceite sintético 10W60 y filtro
Ferrari	F40	1987	10000	Reemplazo de correas de distribución (Timing Belts)
Ferrari	F40	1987	20000	Inspección de tanques de combustible (Rubber Fuel Bladders)
Ferrari	F40	1987	30000	Revisión de sistema de embrague y turbos
Ferrari	488	2018	10000	Diagnóstico telemetría y revisión frenos cerámicos
Ferrari	488	2018	20000	Aceite motor y revisión anual (Genuine Maintenance)
Ferrari	458	2014	10000	Aceite motor y revisión electrónica
Ferrari	458	2014	30000	Revisión sistema escape y frenos
`;

const parseRulesToPautas = () => {
  const groups: Record<string, any> = {};

  rawData.trim().split("\n").forEach((line) => {
    const [brand, model, year, interval, ...titleParts] = line.split("\t");
    const key = `${brand}-${model}`.toLowerCase();

    if (!groups[key]) {
      groups[key] = {
        title: `Pauta ${brand} ${model}`,
        detail: `Mantenimiento completo para ${brand} ${model}.`,
        appliesTo: {
          brandIncludes: [brand.toLowerCase()],
          modelIncludes: [model.toLowerCase()],
        },
        milestones: []
      };
    }

    groups[key].milestones.push({
      km: parseInt(interval, 10),
      title: titleParts.join(" "),
      detail: `Servicio programado a los ${interval} km.`
    });
  });

  return Object.values(groups);
};

export const seedMaintenanceRules = async () => {
  try {
    const rulesCol = collection(db, "maintenanceRules");
    const snapshot = await getDocs(rulesCol);

    console.log("Limpiando base de datos para organizar por pautas...");
    for (const docSnap of snapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    const pautas = parseRulesToPautas();
    console.log(`Subiendo ${pautas.length} pautas agrupadas...`);

    const batch = writeBatch(db);
    for (const pauta of pautas) {
      const newDocRef = doc(rulesCol);
      batch.set(newDocRef, pauta);
    }

    await batch.commit();
    console.log("¡Éxito! Base de datos organizada por modelo con al menos 3 modelos por marca.");
  } catch (error) {
    console.error("Error al organizar Firestore:", error);
  }
};
