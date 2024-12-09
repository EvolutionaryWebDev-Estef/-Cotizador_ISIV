import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Dialog } from 'primereact/dialog';
import { Chart } from 'primereact/chart';
import { Chart as ChartJS } from 'chart.js/auto';
import { addLocale, locale } from 'primereact/api';  
import '../styles/App.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Cotizador from './Cotizador';

addLocale('es', {
    emptyMessage: 'No hay productos disponibles',
});
locale('es');


function ProductoCatalogo({ onSeleccionarProductos }) {
    const [productos, setProductos] = useState([]);
    const [producto, setProducto] = useState({ 
        nombre: '',
        precio: '', 
        peso: '', 
        unidadPeso: 'kg', 
        dimension: '', 
        volumen: '',
        descripccion: '',
        especificaciones: '',
        imagen: '' });
    const [editando, setEditando] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [moneda, setMoneda] = useState('CRC');
    const [searchTerm, setSearchTerm] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [graficoData, setGraficoData] = useState({});
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const navigate = useNavigate();


    const unidadesPeso = [
        { label: 'Kilogramos (kg)', value: 'kg' },
        { label: 'Libras (lbs)', value: 'lbs' },
    ];
    const opcionesMoneda = [
        { label: 'Dólares (USD)', value: 'USD' },
        { label: 'Colones (CRC)', value: 'CRC' },
    ];

    useEffect(() => {
        const productosGuardados = JSON.parse(localStorage.getItem('productos'));
        if (productosGuardados) {
            setProductos(productosGuardados);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProducto({ ...producto, [name]: value });
    };

    const handleDropdownChange = (e) => {
        const { name, value } = e;
        setProducto({ ...producto, unidadPeso: value });
        console.log ('Unidad de Peso:', value);
    };

    const handleFileUpload = (e) => {
        const file = e.files[0];
        const fileUrl = URL.createObjectURL(file);
        setProducto({ ...producto, imagen: fileUrl });
    };

    const filtrarProductos = () => {
        return productos.filter((prod) =>
            prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prod.id.toString().includes(searchTerm)
        );
    };
    const manejarSeleccionProducto = (productoId) => {
        setProductosSeleccionados((prevSeleccionados) => {
                const nuevosSeleccionados = prevSeleccionados.includes(productoId)
                    ? prevSeleccionados.filter((id) => id !== productoId)
                    : [...prevSeleccionados, productoId];
        
                // Aquí notificas al componente padre
                onSeleccionarProductos(nuevosSeleccionados);
                return nuevosSeleccionados;
    
        });
    };


    const validarFormulario = () => {
        if (!producto.nombre || !producto.precio || !producto.peso || !producto.dimension || !producto.unidadPeso) {
            alert('Por favor, llena todos los campos');
            return false;
        }

        if (producto.nombre.length < 3 || producto.nombre.length > 50) {
            alert('El nombre debe tener entre 3 y 50 caracteres');
            return false;
        }

        const nombreRegex = /^[a-zA-Z0-9\s]+$/;
        if (!nombreRegex.test(producto.nombre)) {
            alert('El nombre solo debe contener letras, números y espacios');
            return false;
        }

        if (isNaN(producto.precio) || parseFloat(producto.precio) <= 0 || parseFloat(producto.precio) > 1000000) {
            alert('El precio debe ser un número entre 0 y 1,000,000');
            return false;
        }

        if (isNaN(producto.peso) || parseFloat(producto.peso) <= 0) {
            alert('El peso debe ser un número mayor a 0');
            return false;
        }

        const peso = parseFloat(producto.peso);
        if (producto.unidadPeso === 'kg' && (peso < 0.1 || peso > 500)) {
            alert('El peso en kilogramos debe estar entre 0.1 y 500 kg');
            return false;
        }

        if (producto.unidadPeso === 'lbs' && (peso < 0.1 || peso > 800)) {
            alert('El peso en libras debe estar entre 0.1 y 800lbs');
            return false;
        }

        const dimensionRegex = /^\d+x\d+x\d+$/;
        if (!dimensionRegex.test(producto.dimension)) {
            alert('Las dimensiones deben estar en el formato LxWxH (ejemplo: 10x20x30)');
            return false;
        }

        const productoDuplicado = productos.find((prod) => prod.nombre.toLowerCase() === producto.nombre.toLowerCase());
        if (!editando && productoDuplicado) {
            alert('Ya existe un producto con este nombre');
            return false;
        }

        return true;
    };
        // Función para calcular el volumen del producto
        const calcularVolumen = (dimension) => {
            const dimensiones = dimension.split('x').map(Number);
            if (dimensiones.length === 3) {
                const [longitud, ancho, altura] = dimensiones;
                return (longitud * ancho * altura) / 1000; // Convertir el volumen a m³
            }
            return 0;
        };

    //  Actualización de producto con un ID único

    const handleSubmit = () => {
        if (!validarFormulario()) return;

           // Calcular volumen
           const volumenCalculado = calcularVolumen(producto.dimension);

        const nuevoProducto = {
            ...producto,
            volumen: volumenCalculado, // Incluir el volumen calculado
            id: editando ? productoSeleccionado.id : productos.length + 1,
            moneda,
        };

        if (editando) {
            setProductos(productos.map((prod) => (prod.id === productoSeleccionado.id ? nuevoProducto : prod)));
            setEditando(false);
            setProductoSeleccionado(null);
        } else {
            setProductos([...productos, nuevoProducto]);
        }
             // Guardar los productos en localStorage
        localStorage.setItem('productos', JSON.stringify([...productos, nuevoProducto]));
        setProducto({ nombre: '', precio: '', peso: '', unidadPeso: 'kg', dimension: '',  volumen: '', descripcion: '', especificaciones: '',imagen: '' });
        setMoneda('CRC');

    };

    const handleEdit = (rowData) => {
        setProducto(rowData);
        setProductoSeleccionado(rowData);
        setEditando(true);
    };

    const handleDelete = (id) => {
        setProductos(productos.filter((prod) => prod.id !== id));
    };

    const exportarJSON = () => {
        const dataStr = JSON.stringify(productos, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'productos.json';
        link.click();
    };

    const generarGrafico = () => {
        const precios = productos.map(prod => prod.precio);
        const categorias = productos.map(prod => prod.nombre);

        setGraficoData({
            labels: categorias,
            datasets: [
                {
                    label: 'Precios de Productos',
                    data: precios,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }
            ]
        });
    };
    // Función para redirigir a la página de vista inicial
    const irAtras = () => {
        navigate('/');
    };
     // Función para seleccionar un producto
  const seleccionarProducto = (producto) => {
    setProductosSeleccionados((prev) => [...prev, producto]);
  };

  // Función para redirigir a la página de cotización
  const irACotizacion = () => {
    onSeleccionarProductos(productosSeleccionados); // Actualiza los productos seleccionados en App.js
    navigate('/cotizacion'); // Redirige a la página de cotización
  };
 
  return (
    <div className="contenedor" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200vh',
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
        padding: '300px'
    }}>
        {/* Botón Atrás en la parte superior derecha */}
        <Button icon="pi pi-arrow-left" label="Atrás" className="p-button-rounded p-button-primary" style={{ position: 'absolute', top: '40px', right: '90px' }} onClick={irAtras} />
        
        <h1 style={{ color: '#4CAF50', marginTop: '-150px' }}>Catálogo de Productos</h1>
       <div className="p-fluid p-formgrid p-grid" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
    <div className="p-field p-col-12 p-md-6">
        <label htmlFor="nombre">Nombre</label>
        <InputText id="nombre" name="nombre" value={producto.nombre} onChange={handleInputChange} />
    </div>
<div className="p-field p-col-12 p-md-6">
        <label htmlFor="dimension">Dimensiones</label>
        <InputText id="dimension" name="dimension" value={producto.dimension} onChange={handleInputChange} placeholder="Ej: 10x20x30" />
    </div>
    <div className="p-field">
                    <label>Volumen (m³)</label>
                    <InputText value={producto.volumen || calcularVolumen(producto.dimension)} disabled />
                </div>
    <div className="p-field p-col-12 p-md-6">
    <label htmlFor="descripcion">Descripción</label>
     <InputText id="descripcion" name="descripcion" value={producto.descripcion} onChange={handleInputChange} />
      </div>

     <div className="p-field p-col-12 p-md-6">
   <label htmlFor="especificaciones">Especificaciones</label>
   <InputText id="especificaciones" name="especificaciones" value={producto.especificaciones} onChange={handleInputChange} />
    </div>

    <div className="p-field p-col-12 p-md-6">
        <label htmlFor="moneda">Moneda</label>
        <Dropdown id="moneda" value={moneda} options={opcionesMoneda} onChange={(e) => setMoneda(e.value)} placeholder="Selecciona la moneda" />
    </div>
    <div className="p-field p-col-12 p-md-6">
        <label htmlFor="precio">Precio</label>
        <InputText id="precio" name="precio" value={producto.precio} onChange={handleInputChange} type="number" min="0" step="0.01" />
    </div>
    <div className="p-field p-col-12 p-md-6">
        <label htmlFor="unidadPeso">Unidad</label>
        <Dropdown id="unidadPeso" name="unidadPeso" value={producto.unidadPeso} options={unidadesPeso} onChange={handleDropdownChange} placeholder="Selecciona unidad de peso" />
    </div>
    <div className="p-field p-col-12 p-md-6">
        <label htmlFor="peso">Peso</label>
        <InputText id="peso" name="peso" value={producto.peso} onChange={handleInputChange} type="number" min="0" />
    </div>
    
    <div className=" p-mt-2 ">
        <label htmlFor="imagen">Imagen</label>
        <FileUpload
            name="imagen"
            customUpload
            uploadHandler={handleFileUpload}
            chooseLabel="Seleccionar Imagen"
            uploadLabel="Subir"
            cancelLabel="Cancelar"
        />
    </div>

        <Button label={editando ? 'Actualizar Producto' : 'Agregar Producto'} onClick={handleSubmit} className="p-mt-2 p-button-success" />
 {/*}       <Button label="Exportar a JSON" onClick={exportarJSON} className="p-mt-2 p-button-warning" />
        <Button label="Generar Gráfico" onClick={generarGrafico} className="p-mt-2 p-button-info" />

*/}
</div>


        <h2>Lista de Productos</h2>
        
        <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o ID"
            className="p-inputtext-lg p-mt-2"
            style={{ width: '100%', maxWidth: '500px', marginBottom: '20px' }}
        />
        <DataTable value={filtrarProductos()} paginator rows={10} selection={productosSeleccionados} onSelectionChange={(e) => {
            setProductosSeleccionados(e.value);
            onSeleccionarProductos(e.value);
        }} dataKey="id">
            <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
            <Column field="id" header="ID" />
            <Column field="nombre" header="Nombre" />
            <Column field="moneda" header="Moneda" />
            <Column field="precio" header="Precio" />
            <Column field="unidadPeso" header="Unidad de Peso" />
            <Column field="peso" header="Peso" />
            <Column field="dimension" header="Dimensiones" />
            <Column field="volumen" header="Volumen (m³)" />
            <Column field="descripcion" header="Descripcion" />
            <Column field="especificaciones" header="Especificaciones" />
            <Column body={(rowData) => (
                <>
                    <Button icon="pi pi-pencil" onClick={() => handleEdit(rowData)} className="p-button-rounded p-button-info" />
                    <Button icon="pi pi-trash" onClick={() => handleDelete(rowData.id)} className="p-button-rounded p-button-danger" />
                </>
            )} />
        </DataTable>

        <h3>Productos Seleccionados</h3>
        <Button 
           className="p-button p-button-success"
          onClick={() => navigate('/productos')} 
         style={{ marginTop: '20px', fontSize: '1.5rem', padding: '20px 20px' }}
        >
          Ver Productos
        </Button>
        <Button 
    label="Ir a Cotización" 
    onClick={irACotizacion} 
    className="p-button p-button-primary" // Estilo predeterminado de PrimeReact
    style={{ marginTop: '20px', fontSize: '1.5rem', padding: '20px 20px' }} // Personalización adicional
/>


        <ul style={{ fontSize: '30px', lineHeight: '1.5' }}>
            {productosSeleccionados.map((producto) => (
                <li key={producto.id}>
                    {producto.nombre} - {producto.precio} {producto.moneda}
                </li>
            ))}
        </ul>

        {graficoData.labels && (
            <Dialog visible={mostrarModal} onHide={() => setMostrarModal(false)} header="Gráfico de Precios">
                <Chart type="bar" data={graficoData} />
            </Dialog>
        )}
    </div>
);
}

export default ProductoCatalogo;