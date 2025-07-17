import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";

interface Producto {
  id: string;
  cuit: string;
  razon_social: string;
  mail: string;
  telefono: string;
  identificador_producto: string;
  marca: string;
  modelo: string;
  codigo_interno: string;
  origen: string;
  numero_certificacion: string;
  organismo_certificador: string;
}

export default function ProductoDetalle() {
  const { id } = useParams(); // Obtiene el ID del producto desde la URL
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  // Lista de categorías (colecciones) en Firebase
  const categorias = [
    "CascosAVX",
    "ConQr",
    "ESPEJOS",
    "FrenosBrenta",
    "FrenosChina",
    "NeumaticosCelimo",
    "NeumaticosShivreet",
    "OpticasYFaroles",
    "Varios",
  ];

  useEffect(() => {
    const fetchProducto = async () => {
      setLoading(true);
      let productoEncontrado: Producto | null = null;

      for (const categoria of categorias) {
        console.log(`Buscando en la colección: ${categoria}, ID: ${id}`); // Depuración
        const productoRef = doc(db, categoria, id!);
        const productoSnap = await getDoc(productoRef);

        if (productoSnap.exists()) {
          console.log(`Producto encontrado en la colección: ${categoria}`); // Depuración
          productoEncontrado = { id: productoSnap.id, ...productoSnap.data() } as Producto;
          break;
        } else {
          console.log(`Producto no encontrado en la colección: ${categoria}`); // Depuración
        }
      }

      setProducto(productoEncontrado);
      setLoading(false);
    };

    fetchProducto();
  }, [id]);

  if (loading) return <p>Cargando...</p>;

  if (!producto) return <p>No se encontró el producto.</p>;

  return (
    <div className="container">
      <h1>Detalles del Producto</h1>
      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CUIT</td>
            <td>{producto.cuit}</td>
          </tr>
          <tr>
            <td>Razón Social</td>
            <td>{producto.razon_social}</td>
          </tr>
          <tr>
            <td>Mail</td>
            <td>{producto.mail}</td>
          </tr>
          <tr>
            <td>Teléfono</td>
            <td>{producto.telefono}</td>
          </tr>
          <tr>
            <td>Identificador Producto</td>
            <td>{producto.identificador_producto}</td>
          </tr>
          <tr>
            <td>Marca</td>
            <td>{producto.marca}</td>
          </tr>
          <tr>
            <td>Modelo</td>
            <td>{producto.modelo}</td>
          </tr>
          <tr>
            <td>Código Interno</td>
            <td>{producto.codigo_interno}</td>
          </tr>
          <tr>
            <td>Origen</td>
            <td>{producto.origen}</td>
          </tr>
          <tr>
            <td>Número de Certificación</td>
            <td>{producto.numero_certificacion}</td>
          </tr>
          <tr>
            <td>Organismo Certificador</td>
            <td>{producto.organismo_certificador}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}