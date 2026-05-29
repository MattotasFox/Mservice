import { collection, addDoc, getDocs, deleteDoc, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";

const rawData = `
Chevrolet	Corsa	2004	5000	Cambio de aceite y filtro
Chevrolet	Corsa	2004	10000	Rotación de neumáticos
Chevrolet	Corsa	2004	20000	Cambio filtro de aire
Chevrolet	Corsa	2004	30000	Cambio bujías
Chevrolet	Corsa	2004	40000	Cambio líquido de frenos
Toyota	Corolla	2010	5000	Cambio de aceite y filtro
Toyota	Corolla	2010	15000	Alineación y balanceo
Toyota	Corolla	2010	30000	Cambio filtro de combustible
Toyota	Corolla	2010	60000	Cambio correa accesorios
Toyota	Corolla	2010	80000	Cambio amortiguadores
Hyundai	Accent	2012	5000	Cambio de aceite
Hyundai	Accent	2012	10000	Revisión frenos
Hyundai	Accent	2012	20000	Cambio filtro aire
Hyundai	Accent	2012	40000	Cambio bujías
Hyundai	Accent	2012	60000	Cambio correa distribución
Kia	Rio	2015	5000	Cambio de aceite
Kia	Rio	2015	10000	Revisión suspensión
Kia	Rio	2015	20000	Cambio filtro aire
Kia	Rio	2015	40000	Cambio líquido transmisión
Kia	Rio	2015	80000	Cambio amortiguadores
Nissan	Sentra	2014	5000	Cambio aceite motor
Nissan	Sentra	2014	15000	Rotación neumáticos
Nissan	Sentra	2014	30000	Cambio bujías
Nissan	Sentra	2014	45000	Cambio líquido frenos
Nissan	Sentra	2014	90000	Cambio kit distribución
Mazda	3	2018	5000	Cambio aceite sintético
Mazda	3	2018	10000	Revisión frenos
Mazda	3	2018	20000	Cambio filtro cabina
Mazda	3	2018	40000	Cambio bujías
Mazda	3	2018	80000	Cambio amortiguadores
Ford	Fiesta	2011	5000	Cambio aceite
Ford	Fiesta	2011	10000	Rotación neumáticos
Ford	Fiesta	2011	20000	Cambio filtro aire
Ford	Fiesta	2011	50000	Cambio líquido dirección
Ford	Fiesta	2011	70000	Cambio embrague
Volkswagen	Gol	2013	5000	Cambio aceite y filtro
Volkswagen	Gol	2013	15000	Alineación y balanceo
Volkswagen	Gol	2013	30000	Cambio bujías
Volkswagen	Gol	2013	60000	Cambio correa distribución
Volkswagen	Gol	2013	90000	Cambio amortiguadores
Peugeot	208	2019	5000	Cambio aceite sintético
Peugeot	208	2019	10000	Revisión frenos
Peugeot	208	2019	20000	Cambio filtro aire
Peugeot	208	2019	40000	Cambio bujías
Peugeot	208	2019	60000	Cambio líquido transmisión
Renault	Clio	2008	5000	Cambio aceite
Renault	Clio	2008	10000	Rotación neumáticos
Renault	Clio	2008	20000	Cambio filtro combustible
Renault	Clio	2008	40000	Cambio líquido frenos
Renault	Clio	2008	80000	Cambio kit distribución
Suzuki	Swift	2017	5000	Cambio aceite
Suzuki	Swift	2017	10000	Revisión suspensión
Suzuki	Swift	2017	20000	Cambio filtro aire
Suzuki	Swift	2017	40000	Cambio bujías
Suzuki	Swift	2017	80000	Cambio amortiguadores
Honda	Civic	2016	5000	Cambio aceite sintético
Honda	Civic	2016	10000	Revisión frenos
Honda	Civic	2016	30000	Cambio filtro aire
Honda	Civic	2016	60000	Cambio líquido transmisión
Honda	Civic	2016	90000	Cambio kit distribución
Subaru	Impreza	2015	5000	Cambio aceite
Subaru	Impreza	2015	15000	Rotación neumáticos
Subaru	Impreza	2015	30000	Cambio bujías
Subaru	Impreza	2015	60000	Cambio líquido diferencial
Subaru	Impreza	2015	100000	Cambio amortiguadores
Mitsubishi	Lancer	2012	5000	Cambio aceite
Mitsubishi	Lancer	2012	10000	Revisión frenos
Mitsubishi	Lancer	2012	20000	Cambio filtro aire
Mitsubishi	Lancer	2012	40000	Cambio líquido transmisión
Mitsubishi	Lancer	2012	80000	Cambio kit distribución
Audi	A3	2019	5000	Cambio aceite premium
Audi	A3	2019	10000	Revisión electrónica
Audi	A3	2019	30000	Cambio filtro cabina
Audi	A3	2019	60000	Cambio DSG
Audi	A3	2019	90000	Cambio suspensión
BMW	Serie 3	2018	5000	Cambio aceite sintético
BMW	Serie 3	2018	10000	Revisión frenos
BMW	Serie 3	2018	30000	Cambio filtro aire
BMW	Serie 3	2018	60000	Cambio líquido transmisión
BMW	Serie 3	2018	100000	Cambio suspensión
Mercedes-Benz	Clase C	2020	5000	Cambio aceite premium
Mercedes-Benz	Clase C	2020	15000	Revisión frenos
Mercedes-Benz	Clase C	2020	30000	Cambio filtro cabina
Mercedes-Benz	Clase C	2020	60000	Cambio transmisión automática
Mercedes-Benz	Clase C	2020	100000	Cambio amortiguadores
Fiat	Palio	2009	5000	Cambio aceite
Fiat	Palio	2009	10000	Rotación neumáticos
Fiat	Palio	2009	20000	Cambio filtro aire
Fiat	Palio	2009	40000	Cambio bujías
Fiat	Palio	2009	70000	Cambio embrague
Jeep	Compass	2021	5000	Cambio aceite sintético
Jeep	Compass	2021	10000	Revisión tracción
Jeep	Compass	2021	30000	Cambio filtro aire
Jeep	Compass	2021	60000	Cambio líquido transmisión
Jeep	Compass	2021	90000	Cambio suspensión
Tesla	Model 3	2022	10000	Revisión software y batería
Tesla	Model 3	2022	20000	Rotación neumáticos
Tesla	Model 3	2022	40000	Cambio filtro cabina
Tesla	Model 3	2022	60000	Revisión sistema frenos
Tesla	Model 3	2022	100000	Revisión batería principal
Volvo	XC60	2020	5000	Cambio aceite
Volvo	XC60	2020	15000	Revisión frenos
Volvo	XC60	2020	30000	Cambio filtro aire
Volvo	XC60	2020	60000	Cambio líquido transmisión
Volvo	XC60	2020	100000	Cambio suspensión
`;

const parseRules = () => {
  return rawData
    .trim()
    .split("\n")
    .map((line) => {
      const [brand, model, year, interval, ...titleParts] = line.split("\t");
      return {
        title: titleParts.join(" "),
        detail: `Mantenimiento sugerido según pauta para ${brand} ${model} (${year}).`,
        intervalKm: parseInt(interval, 10),
        appliesTo: {
          brandIncludes: [brand.toLowerCase()],
          modelIncludes: [model.toLowerCase()],
        },
      };
    });
};

export const seedMaintenanceRules = async () => {
  try {
    const rulesCol = collection(db, "maintenanceRules");
    const snapshot = await getDocs(rulesCol);

    // Si ya hay muchos documentos, no sobrescribimos a menos que sea necesario
    if (snapshot.size > 50) {
      console.log("La base de datos ya está poblada con reglas.");
      return;
    }

    console.log("Limpiando reglas antiguas...");
    for (const docSnap of snapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    console.log("Cargando nuevas reglas...");
    const rules = parseRules();

    // Usamos batches para eficiencia (Firebase permite hasta 500 operaciones por batch)
    let batch = writeBatch(db);
    let count = 0;

    for (const rule of rules) {
      const newDocRef = doc(rulesCol);
      batch.set(newDocRef, rule);
      count++;

      if (count === 400) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }

    await batch.commit();
    console.log(`¡Éxito! Se han subido ${rules.length} reglas a Firestore.`);
  } catch (error) {
    console.error("Error al poblar Firestore:", error);
  }
};
