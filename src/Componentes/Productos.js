import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const VistaProductos = () => {
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [seleccionados, setSeleccionados] = useState([]); // Estado para productos seleccionados
    const navigate = useNavigate();

    useEffect(() => {
        const productosGuardados = JSON.parse(localStorage.getItem('productos')) || [];
        setProductos(productosGuardados);
    }, []);

    const handleDelete = (id) => {
        const productosActualizados = productos.filter((prod) => prod.id !== id);
        setProductos(productosActualizados);
        localStorage.setItem('productos', JSON.stringify(productosActualizados));
    };

    const handleEdit = (producto) => {
        setProductoSeleccionado(producto);
    };

    const handleSaveEdit = () => {
        const productosActualizados = productos.map((prod) =>
            prod.id === productoSeleccionado.id ? productoSeleccionado : prod
        );
        setProductos(productosActualizados);
        localStorage.setItem('productos', JSON.stringify(productosActualizados));
        setProductoSeleccionado(null); // Reset form after saving
    };

    // Manejar la selección de productos
    const handleSeleccionar = (id) => {
        setSeleccionados((prevSeleccionados) => {
            if (prevSeleccionados.includes(id)) {
                // Si ya está seleccionado, lo eliminamos de la lista
                return prevSeleccionados.filter((itemId) => itemId !== id);
            } else {
                // Si no está seleccionado, lo agregamos
                return [...prevSeleccionados, id];
            }
        });
    };

    // Navegar a la página de cotización con los productos seleccionados
    const irACotizacion = () => {
        // Filtrar los productos seleccionados y almacenarlos en localStorage
        const productosSeleccionados = productos.filter((producto) =>
            seleccionados.includes(producto.id)
        );
        localStorage.setItem('productosCotizacion', JSON.stringify(productosSeleccionados)); // Guardar productos seleccionados en localStorage
        navigate('/cotizacion');
    };

    return (
        <Box
            sx={{
                padding: 3,
                backgroundColor: '#f5f5f5',
                fontSize: '1rem',
                height: '100vh',
                position: 'relative',
            }}
        >
            {/* Botones */}
            <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => navigate('/catalogo')} 
                sx={{
                    position: 'absolute', top: 150, left: 120, fontSize: '1.50rem', fontFamily: 'Poppins, sans-serif',
                    padding: '10px 20px', backgroundColor: '#4CAF50', // Color verde
                    '&:hover': { backgroundColor: '#45a049' }
                }}
            >
                Ir a Catálogo
            </Button>

            <Button
                variant="contained"
                onClick={irACotizacion}
                sx={{
                    position: 'absolute', top: 150, left: 380, fontSize: '1.50rem', fontFamily: 'Poppins, sans-serif',
                    padding: '10px 20px', backgroundColor: '#2196F3', // Color azul
                    '&:hover': { backgroundColor: '#1976D2' }
                }}
            >
                Ir a Cotizaciones
            </Button>

            <Button 
                variant='contained'
                icon="pi pi-arrow-left" label="Atrás" className="p-button-rounded p-button-primary" style={{ position: 'absolute', top: '40px', right: '90px' }}  onClick={() => navigate('/')} 
            >
                Atrás
            </Button>

            <Typography variant="h3" sx={{ marginBottom: 3, position: 'absolute', top: 80, left: 20 }}>
                Productos Existentes
            </Typography>

            {/* Contenedor para la tabla con desplazamiento */}
            <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto', marginTop: 30 }}>
                <Paper>
                    <Table sx={{ minWidth: '100%', tableLayout: 'fixed' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Seleccionar</TableCell>
                                <TableCell>ID</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Precio</TableCell>
                                <TableCell>Peso</TableCell>
                                <TableCell>Dimensión</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Especificaciones</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productos.map((producto) => (
                                <TableRow key={producto.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={seleccionados.includes(producto.id)} // Marca el checkbox si el producto está seleccionado
                                            onChange={() => handleSeleccionar(producto.id)} // Maneja la selección o deselección
                                        />
                                    </TableCell>
                                    <TableCell>{producto.id}</TableCell>
                                    <TableCell>{producto.nombre}</TableCell>
                                    <TableCell>{producto.precio}</TableCell>
                                    <TableCell>{producto.peso}</TableCell>
                                    <TableCell>{producto.dimension}</TableCell>
                                    <TableCell>{producto.descripcion}</TableCell>
                                    <TableCell>{producto.especificaciones}</TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="outlined" 
                                            color="primary" 
                                            onClick={() => handleEdit(producto)}
                                        >
                                            Editar
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            color="error" 
                                            onClick={() => handleDelete(producto.id)}
                                            sx={{ marginLeft: 1 }}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>

            {/* Formulario para editar el producto seleccionado */}
            {productoSeleccionado && (
                <Box sx={{ marginTop: 3, backgroundColor: '#fff', padding: 3, borderRadius: '8px' }}>
                    <Typography variant="h5">Editar Producto</Typography>
                    <TextField
                        label="Nombre"
                        value={productoSeleccionado.nombre}
                        onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, nombre: e.target.value })}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        label="Precio"
                        value={productoSeleccionado.precio}
                        onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, precio: e.target.value })}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        label="Peso"
                        value={productoSeleccionado.peso}
                        onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, peso: e.target.value })}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        label="Dimensión"
                        value={productoSeleccionado.dimension}
                        onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, dimension: e.target.value })}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        label="Descripción"
                        value={productoSeleccionado.descripcion}
                        onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, descripcion: e.target.value })}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        label="Especificaciones"
                        value={productoSeleccionado.especificaciones}
                        onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, especificaciones: e.target.value })}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />

                    <Button 
                        variant="contained" 
                        onClick={handleSaveEdit} 
                        sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
                    >
                        Guardar Cambios
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default VistaProductos;
