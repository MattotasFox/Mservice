import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where
} from "firebase/firestore";
import { Inspection } from "./types";

const COLLECTION_NAME = "inspecciones";

export const newId = () =>
  `insp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// GUARDAR en Firebase
export const saveInspection = async (id: string, data: Inspection) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);

    // Preparar datos para Firestore
    const payload = {
      ...data,
      id,
      creadoEn: data.creadoEn || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload, { merge: true });

    // Opcional: Guardar/Actualizar Cliente
    if (data.cliente.rut) {
      const clienteId = data.cliente.rut.replace(/[^a-zA-Z0-9]/g, "");
      await setDoc(doc(db, "clientes", clienteId), {
        ...data.cliente,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    // Opcional: Guardar/Actualizar Vehículo
    if (data.vehiculo.patente) {
      const vehiculoId = data.vehiculo.patente.toUpperCase();
      await setDoc(doc(db, "vehiculos", vehiculoId), {
        ...data.vehiculo,
        ultimaInspeccion: serverTimestamp(),
      }, { merge: true });
    }

    console.log("Documento guardado en Firebase con ID: ", id);
    return id;
  } catch (e) {
    console.error("Error al guardar en Firebase: ", e);
    throw e;
  }
};

// LEER UNA inspección de Firebase
export const getInspection = async (id: string): Promise<Inspection | undefined> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Inspection;
    }
    return undefined;
  } catch (e) {
    console.error("Error al obtener inspección:", e);
    return undefined;
  }
};

// LISTAR todas las inspecciones de Firebase
export const loadInspections = async (): Promise<Inspection[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const inspections: Inspection[] = [];
    querySnapshot.forEach((doc) => {
      inspections.push(doc.data() as Inspection);
    });
    return inspections;
  } catch (e) {
    console.error("Error al cargar inspecciones:", e);
    return [];
  }
};

// ELIMINAR de Firebase
export const deleteInspection = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (e) {
    console.error("Error al eliminar inspección:", e);
    throw e;
  }
};
