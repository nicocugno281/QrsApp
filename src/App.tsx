import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import ProductosTabla from "./components/ProductosTabla";
import Catalogo from "./components/Catalogo";

function App() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("NeumaticosShivreet");

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProductosTabla
            categoriaSeleccionada={categoriaSeleccionada}
            setCategoriaSeleccionada={setCategoriaSeleccionada}
          />
        }
      />
      <Route
        path="/catalogo"
        element={
          <Catalogo
            categoriaSeleccionada={categoriaSeleccionada}
            setCategoriaSeleccionada={setCategoriaSeleccionada}
          />
        }
      />
    </Routes>
  );
}

export default App;
