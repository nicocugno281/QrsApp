import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import Modal from "./Modal";
import QRCode from "qrcode";
import { FaEdit, FaQrcode, FaPlus, FaTrash } from "react-icons/fa";
import CategoriaSelector from "./CategoriaSelector";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import logo from "../../image.png"; // Ruta corregida para la imagen

interface Producto {
  id?: string; // ID opcional para nuevos productos
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

interface ProductosTablaProps {
  categoriaSeleccionada: string;
}

export default function ProductosTabla({
  categoriaSeleccionada,
  setCategoriaSeleccionada,
}: ProductosTablaProps & { setCategoriaSeleccionada: (categoria: string) => void }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [newProducto, setNewProducto] = useState<Producto>({
    cuit: "20-14408519-2",
    razon_social: "ALEJANDRO JOSE VISOKOLSKIS",
    mail: "motos@okinoi.com.ar",
    telefono: "0351-4750111",
    identificador_producto: "",
    marca: "",
    modelo: "",
    codigo_interno: "",
    origen: "",
    numero_certificacion: "",
    organismo_certificador: "",
  });
  const [qrProducto, setQrProducto] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false); // Modal para nuevo producto
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const itemsPerPage = 10;

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto({
      ...producto,
      cuit: producto.cuit || "",
      razon_social: producto.razon_social || "",
      mail: producto.mail || "",
      telefono: producto.telefono || "",
      identificador_producto: producto.identificador_producto || "",
      marca: producto.marca || "",
      modelo: producto.modelo || "",
      codigo_interno: producto.codigo_interno || "",
      origen: producto.origen || "",
      numero_certificacion: producto.numero_certificacion || "",
      organismo_certificador: producto.organismo_certificador || "",
    });
    setIsEditModalOpen(true);
    setIsQRModalOpen(false);
  };

  const handleSave = async () => {
    if (editingProducto) {
      const productoRef = doc(db, categoriaSeleccionada, editingProducto.id!);
      await updateDoc(productoRef, { ...editingProducto });
      setProductos((prev) =>
        prev.map((producto) =>
          producto.id === editingProducto.id ? editingProducto : producto
        )
      );
      setEditingProducto(null);
      setIsEditModalOpen(false);
    }
  };

  const handleChangeNewProducto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProducto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeEditingProducto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingProducto((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handleGenerateQR = async (producto: Producto) => {
    const url = `http://localhost:5173/producto/${producto.id}`;
    console.log(`Generando QR para URL: ${url}, ID: ${producto.id}`);
    try {
      const qrCode = await QRCode.toDataURL(url);
      setQrCode(qrCode);
      setQrProducto(producto);
      setIsQRModalOpen(true);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error al generar QR:", error);
    }
  };

  const handleCreateNewProducto = async () => {
    if (newProducto) {
      const productosRef = collection(db, categoriaSeleccionada);
      const docRef = await addDoc(productosRef, {
        ...newProducto,
        cuit: "20-14408519-2",
        razon_social: "ALEJANDRO JOSE VISOKOLSKIS",
        mail: "motos@okinoi.com.ar",
        telefono: "0351-4750111",
      });
      setProductos((prev) => [
        ...prev,
        { id: docRef.id, ...newProducto },
      ]);
      setNewProducto({
        cuit: "20-14408519-2",
        razon_social: "ALEJANDRO JOSE VISOKOLSKIS",
        mail: "motos@okinoi.com.ar",
        telefono: "0351-4750111",
        identificador_producto: "",
        marca: "",
        modelo: "",
        codigo_interno: "",
        origen: "",
        numero_certificacion: "",
        organismo_certificador: "",
      });
      setIsNewModalOpen(false);
    }
  };

  const handleDelete = async (productoId: string) => {
    const productoRef = doc(db, categoriaSeleccionada, productoId);
    await deleteDoc(productoRef);
    setProductos((prev) => prev.filter((producto) => producto.id !== productoId));
  };

  const handleDownloadPDF = async () => {
    const qrElement = document.querySelector(".qr-container img"); // Selecciona el elemento del QR
    if (!qrElement) return;

    const canvas = await html2canvas(qrElement as HTMLElement);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();

    pdf.addImage(imgData, "PNG", 10, 10, 180, 180); // Ajusta el tamaño y posición del QR en el PDF

    // Usa el código interno del producto como nombre del archivo
    const nombreArchivo = qrProducto?.codigo_interno || `QR_${qrProducto?.id}`;
    pdf.save(`${nombreArchivo}.pdf`); // Nombre del archivo PDF
  };

  const handleDownloadAllQRsSeparately = async () => {
    for (const producto of productos) {
      const qrData = `
        Identif Producto: ${producto.identificador_producto}
        Marca: ${producto.marca}
        Modelo: ${producto.modelo}
        Código Interno: ${producto.codigo_interno}
        Origen: ${producto.origen}
        Número de Certificación: ${producto.numero_certificacion}
        Organismo Certificador: ${producto.organismo_certificador}
        Razón Social: ${producto.razon_social}
        CUIT: ${producto.cuit}
        Mail: ${producto.mail}
        Teléfono: ${producto.telefono}
      `;

      try {
        const qrCode = await QRCode.toDataURL(qrData);
        const pdf = new jsPDF();

        pdf.addImage(qrCode, "PNG", 10, 10, 180, 180); // Ajusta el tamaño y posición del QR en el PDF
        pdf.text(`Código Interno: ${producto.codigo_interno}`, 10, 200); // Agrega el código interno como texto en el PDF

        const nombreArchivo = producto.codigo_interno || `QR_${producto.id}`;
        pdf.save(`${nombreArchivo}.pdf`); // Descarga el archivo PDF
      } catch (error) {
        console.error(`Error generando QR para producto ${producto.id}:`, error);
      }
    }
  };

  const handleDownloadAllQRsAsZip = async () => {
    const zip = new JSZip();

    for (const producto of productos) {
      const qrData = `
        Identif Producto: ${producto.identificador_producto}
        Marca: ${producto.marca}
        Modelo: ${producto.modelo}
        Código Interno: ${producto.codigo_interno}
        Origen: ${producto.origen}
        Número de Certificación: ${producto.numero_certificacion}
        Organismo Certificador: ${producto.organismo_certificador}
        Razón Social: ${producto.razon_social}
        CUIT: ${producto.cuit}
        Mail: ${producto.mail}
        Teléfono: ${producto.telefono}
      `;

      try {
        const qrCode = await QRCode.toDataURL(qrData);
        const pdf = new jsPDF();

        pdf.addImage(qrCode, "PNG", 10, 10, 180, 180); // Ajusta el tamaño y posición del QR en el PDF
        pdf.text(`Código Interno: ${producto.codigo_interno}`, 10, 200); // Agrega el código interno como texto en el PDF

        const nombreArchivo = producto.codigo_interno || `QR_${producto.id}`;
        const pdfBlob = pdf.output("blob");

        zip.file(`${nombreArchivo}.pdf`, pdfBlob); // Agrega el archivo PDF al ZIP
      } catch (error) {
        console.error(`Error generando QR para producto ${producto.id}:`, error);
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `QRs_${categoriaSeleccionada}.zip`); // Descarga el archivo ZIP
  };

  const handleDownloadAllQRsAsPNG = async () => {
    const zip = new JSZip();

    for (const producto of productos) {
      const qrData = `
        Identif Producto: ${producto.identificador_producto}
        Marca: ${producto.marca}
        Modelo: ${producto.modelo}
        Código Interno: ${producto.codigo_interno}
        Origen: ${producto.origen}
        Número de Certificación: ${producto.numero_certificacion}
        Organismo Certificador: ${producto.organismo_certificador}
        Razón Social: ${producto.razon_social}
        CUIT: ${producto.cuit}
        Mail: ${producto.mail}
        Teléfono: ${producto.telefono}
      `;

      try {
        const qrCode = await QRCode.toDataURL(qrData);
        const qrBlob = await fetch(qrCode).then((res) => res.blob());

        const nombreArchivo = producto.codigo_interno || `QR_${producto.id}`;
        zip.file(`${nombreArchivo}.png`, qrBlob); // Agrega el archivo PNG al ZIP
      } catch (error) {
        console.error(`Error generando QR para producto ${producto.id}:`, error);
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `QRs_${categoriaSeleccionada}_PNG.zip`); // Descarga el archivo ZIP
  };

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
      {/* Logo de la empresa */}
      <div className="logo-container">
        <img src={logo} alt="Logo de la empresa" className="logo" />
      </div>

      <h1>Productos por Categoría</h1>
      <CategoriaSelector
        categoriaSeleccionada={categoriaSeleccionada}
        setCategoriaSeleccionada={setCategoriaSeleccionada}
      />
      <input
        type="text"
        placeholder="Buscar por Código Interno"
        value={searchTerm}
        onChange={handleSearch}
      />
      <button onClick={() => setIsNewModalOpen(true)} className="btn">
        <FaPlus style={{ marginRight: "0.25rem" }} />
      </button>
      <button onClick={handleDownloadAllQRsAsZip} className="btn">
        <FaQrcode style={{ marginRight: "0.25rem" }} />
        PDF
      </button>
      <button onClick={handleDownloadAllQRsAsPNG} className="btn">
        <FaQrcode style={{ marginRight: "0.25rem" }} />
        PNG
      </button>
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
              <th>Acciones</th>
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
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleEdit(producto)} className="btn">
                    <FaEdit style={{ marginRight: "0.25rem" }} />
                    Editar
                  </button>
                  <button onClick={() => handleGenerateQR(producto)} className="btn">
                    <FaQrcode style={{ marginRight: "0.25rem" }} />
                    QR
                  </button>
                  <button onClick={() => handleDelete(producto.id!)} className="btn">
                    <FaTrash style={{ marginRight: "0.25rem" }} />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="btn"
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de{" "}
          {Math.ceil(filteredProductos.length / itemsPerPage)}
        </span>
        <button
          disabled={currentPage === Math.ceil(filteredProductos.length / itemsPerPage)}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="btn"
        >
          Siguiente
        </button>
      </div>
      {isNewModalOpen && (
        <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)}>
          <div>
            <h2>Nuevo Producto</h2>
            <form>
              <label>
                CUIT:
                <input
                  type="text"
                  name="cuit"
                  value={newProducto.cuit}
                  disabled
                />
              </label>
              <label>
                Razón Social:
                <input
                  type="text"
                  name="razon_social"
                  value={newProducto.razon_social}
                  disabled
                />
              </label>
              <label>
                Mail:
                <input
                  type="email"
                  name="mail"
                  value={newProducto.mail}
                  disabled
                />
              </label>
              <label>
                Teléfono:
                <input
                  type="text"
                  name="telefono"
                  value={newProducto.telefono}
                  disabled
                />
              </label>
              <label>
                Identificador Producto:
                <input
                  type="text"
                  name="identificador_producto"
                  value={newProducto.identificador_producto}
                  onChange={handleChangeNewProducto}
                />
              </label>
              <label>
                Marca:
                <input
                  type="text"
                  name="marca"
                  value={newProducto.marca}
                  onChange={handleChangeNewProducto}
                />
              </label>
              <label>
                Modelo:
                <input
                  type="text"
                  name="modelo"
                  value={newProducto.modelo}
                  onChange={handleChangeNewProducto}
                />
              </label>
              <label>
                Código Interno:
                <input
                  type="text"
                  name="codigo_interno"
                  value={newProducto.codigo_interno || ""}
                  onChange={handleChangeNewProducto}
                />
              </label>
              <label>
                Origen:
                <input
                  type="text"
                  name="origen"
                  value={newProducto.origen}
                  onChange={handleChangeNewProducto}
                />
              </label>
              <label>
                Número de Certificación:
                <input
                  type="text"
                  name="numero_certificacion"
                  value={newProducto.numero_certificacion}
                  onChange={handleChangeNewProducto}
                />
              </label>
              <label>
                Organismo Certificador:
                <input
                  type="text"
                  name="organismo_certificador"
                  value={newProducto.organismo_certificador}
                  onChange={handleChangeNewProducto}
                />
              </label>
              <button type="button" onClick={handleCreateNewProducto}>
                Crear
              </button>
              <button type="button" onClick={() => setIsNewModalOpen(false)}>
                Cerrar
              </button>
            </form>
          </div>
        </Modal>
      )}
      {isEditModalOpen && editingProducto && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <div>
            <h2>Editar Producto</h2>
            <form>
              <label>
                CUIT:
                <input
                  type="text"
                  name="cuit"
                  value={editingProducto.cuit}
                  disabled
                />
              </label>
              <label>
                Razón Social:
                <input
                  type="text"
                  name="razon_social"
                  value={editingProducto.razon_social}
                  disabled
                />
              </label>
              <label>
                Mail:
                <input
                  type="email"
                  name="mail"
                  value={editingProducto.mail}
                  disabled
                />
              </label>
              <label>
                Teléfono:
                <input
                  type="text"
                  name="telefono"
                  value={editingProducto.telefono}
                  disabled
                />
              </label>
              <label>
                Identificador Producto:
                <input
                  type="text"
                  name="identificador_producto"
                  value={editingProducto.identificador_producto}
                  onChange={handleChangeEditingProducto}
                />
              </label>
              <label>
                Marca:
                <input
                  type="text"
                  name="marca"
                  value={editingProducto.marca}
                  onChange={handleChangeEditingProducto}
                />
              </label>
              <label>
                Modelo:
                <input
                  type="text"
                  name="modelo"
                  value={editingProducto.modelo}
                  onChange={handleChangeEditingProducto}
                />
              </label>
              <label>
                Código Interno:
                <input
                  type="text"
                  name="codigo_interno"
                  value={editingProducto.codigo_interno || ""}
                  onChange={handleChangeEditingProducto}
                />
              </label>
              <label>
                Origen:
                <input
                  type="text"
                  name="origen"
                  value={editingProducto.origen}
                  onChange={handleChangeEditingProducto}
                />
              </label>
              <label>
                Número de Certificación:
                <input
                  type="text"
                  name="numero_certificacion"
                  value={editingProducto.numero_certificacion}
                  onChange={handleChangeEditingProducto}
                />
              </label>
              <label>
                Organismo Certificador:
                <input
                  type="text"
                  name="organismo_certificador"
                  value={editingProducto.organismo_certificador}
                  onChange={handleChangeEditingProducto}
                />
              </label>
              <button type="button" onClick={handleSave}>
                Guardar
              </button>
              <button type="button" onClick={() => setIsEditModalOpen(false)}>
                Cerrar
              </button>
            </form>
          </div>
        </Modal>
      )}
      {isQRModalOpen && qrCode && qrProducto && (
        <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)}>
          <div className="qr-container">
            <h2>Código QR</h2>
            <a href={`http://localhost:5173/producto/${qrProducto.id}`} target="_blank" rel="noopener noreferrer">
              <img src={qrCode} alt="Código QR" />
            </a>
            <div className="button-group">
              <button type="button" onClick={handleDownloadPDF}>
                Descargar
              </button>
              <button type="button" onClick={() => setIsQRModalOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}