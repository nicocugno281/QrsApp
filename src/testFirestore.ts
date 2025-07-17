import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function agregarProductoDePrueba() {
  try {
    const docRef = await addDoc(collection(db, "productos"), {
      nombre: "Producto de prueba",
      descripcion: "Este es un producto creado desde el frontend",
      fecha: new Date().toISOString()
    });
    console.log("Producto creado con ID:", docRef.id);
  } catch (e) {
    console.error("Error al agregar producto:", e);
  }
}
