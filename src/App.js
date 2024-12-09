import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CatalogoProductos from './Componentes/CatalogoProductos';
import './styles/App.css';
import Cotizador from './Componentes/Cotizador';
import Productos from './Componentes/Productos';
import VistaInicial from './Incio/vistaInicial';



function App() {
  const [products, setProducts] = useState([]);

  // Función para actualizar los productos seleccionados
  const actualizarProductosSeleccionados = (nuevosProductos) => {
    setProducts(nuevosProductos);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta para la vista inicial */}
          <Route path="/" element={<VistaInicial />} />

          {/* Ruta para el catálogo de productos */}
          <Route
            path="/catalogo"
            element={
              <CatalogoProductos onSeleccionarProductos={actualizarProductosSeleccionados} />
            }
          />

          {/* Ruta para ver productos existentes */}
          <Route path="/productos" element={<Productos productos={products} />} />

          {/* Ruta para el cotizador */}
          <Route path="/cotizacion" element={<Cotizador productos={products} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;