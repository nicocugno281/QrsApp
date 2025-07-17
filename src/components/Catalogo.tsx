import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import CategoriaSelector from "./CategoriaSelector";

interface Producto {
  id?: string;
  cuit: string;
  razon_social: string;
  mail: string;
  telefono: string;
  identificador_producto: string;
  marca: string;
  modelo: string;
  codigo_interno: string | null;
  origen: string;
  numero_certificacion: string;
  organismo_certificador: string;
}

interface CatalogoProps {
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (categoria: string) => void;
}

export default function Catalogo({
  categoriaSeleccionada,
  setCategoriaSeleccionada,
}: CatalogoProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Número de registros por página

  const obtenerProductos = async () => {
    setLoading(true);
    const productosRef = collection(db, categoriaSeleccionada);
    const querySnapshot = await getDocs(productosRef);
    const productosData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Producto[];
    setProductos(productosData);
    setLoading(false);
  };

  useEffect(() => {
    obtenerProductos();
  }, [categoriaSeleccionada]);

  const filteredProductos = productos.filter((producto) => {
    const codigoInterno = producto.codigo_interno ? String(producto.codigo_interno) : "";
    return codigoInterno.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const paginatedProductos = filteredProductos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container">
      <h1>Catálogo de Productos</h1>
      <CategoriaSelector
        categoriaSeleccionada={categoriaSeleccionada}
        setCategoriaSeleccionada={setCategoriaSeleccionada}
      />
      <input
        type="text"
        placeholder="Buscar por Código Interno"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading ? (
        <p>Cargando...</p>
      ) : filteredProductos.length === 0 ? (
        <p>No hay productos disponibles para esta categoría.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>CUIT</th>
              <th>Razón Social</th>
              <th>Mail</th>
              <th>Teléfono</th>
              <th>Identif Producto</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Código Interno</th>
              <th>Origen</th>
              <th>Número de Certificación</th>
              <th>Organismo Certificador</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProductos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.cuit}</td>
                <td>{producto.razon_social}</td>
                <td>{producto.mail}</td>
                <td>{producto.telefono}</td>
                <td>{producto.identificador_producto || "Sin identificador"}</td>
                <td>{producto.marca}</td>
                <td>{producto.modelo}</td>
                <td>{producto.codigo_interno}</td>
                <td>{producto.origen}</td>
                <td>{producto.numero_certificacion}</td>
                <td>{producto.organismo_certificador}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {Math.ceil(filteredProductos.length / itemsPerPage)}
        </span>
        <button
          disabled={currentPage === Math.ceil(filteredProductos.length / itemsPerPage)}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}