interface CategoriaSelectorProps {
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (categoria: string) => void;
}

export default function CategoriaSelector({
  categoriaSeleccionada,
  setCategoriaSeleccionada,
}: CategoriaSelectorProps) {
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

  return (
    <select
      value={categoriaSeleccionada}
      onChange={(e) => setCategoriaSeleccionada(e.target.value)}
    >
      {categorias.map((categoria) => (
        <option key={categoria} value={categoria}>
          {categoria}
        </option>
      ))}
    </select>
  );
}