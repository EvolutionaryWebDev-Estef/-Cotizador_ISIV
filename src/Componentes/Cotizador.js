import React, { useState, useEffect, useCallback } from 'react';
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useFormik } from 'formik';

const Cotizador = ({ productos }) => {
    // Parámetros de contenedores
    const [capacidadContenedor, setCapacidadContenedor] = useState({ peso: 1000, volumen: 10 }); // Ejemplo: 1000kg y 10m³
    const [productosCotizados, setProductosCotizados] = useState([]);
    const [totalCotizadoGeneral, setTotalCotizadoGeneral] = useState(0);

    // Parámetros de impuestos
    const [origen, setOrigen] = useState('Latinoamérica');
    const [impuestosFijos, setImpuestosFijos] = useState(0); // Porcentaje de impuestos

    // Definición de estados faltantes
    const [almacenajeFijo, setAlmacenajeFijo] = useState(0);  // Porcentaje de almacenaje
    const [transporteFijo, setTransporteFijo] = useState(0);  // Monto fijo de transporte
    const [utilidadFija, setUtilidadFija] = useState(0);  // Porcentaje de utilidad

    // Definir los impuestos por origen
    const impuestosPorOrigen = {
        'Latinoamérica': 10,  // Ejemplo: 10% de impuestos
        'Europa': 15,        // Ejemplo: 15% de impuestos
        'Asia': 5            // Ejemplo: 5% de impuestos
    };

    // Función que calcula la cotización de cada producto
    const calcularCotizacion = useCallback(() => {
        const productosConCotizacion = productos.map((producto) => {
            const precioUnitario = parseFloat(producto.precio) || 0;
            const cantidad = producto.cantidad || 0;
            const impuestos = (impuestosPorOrigen[origen] / 100) * precioUnitario;
            const almacenaje = (almacenajeFijo / 100) * precioUnitario;
            const transporteFiscal = cantidad * 0.01; // 1% del costo
            const transporteFinal = transporteFijo > 0 ? transporteFijo : 1; // Si transporteFijo es cero, asignar valor mínimo
            const utilidad = (utilidadFija / 100) * (precioUnitario + transporteFiscal + impuestos + almacenaje + transporteFinal);
            const totalPorUnidad = precioUnitario + impuestos + almacenaje + transporteFiscal + transporteFinal + utilidad;

            // Calcular contenedores necesarios
            const pesoTotalProducto = cantidad * producto.peso;
            const volumenTotalProducto = cantidad * producto.volumen;
            const contenedoresNecesariosPorPeso = Math.ceil(pesoTotalProducto / capacidadContenedor.peso);
            const contenedoresNecesariosPorVolumen = Math.ceil(volumenTotalProducto / capacidadContenedor.volumen);
            const contenedoresNecesarios = Math.max(contenedoresNecesariosPorPeso, contenedoresNecesariosPorVolumen);

            return {
                ...producto,
                totalPorUnidad: Number(totalPorUnidad),
                cantidad,
                impuestos,
                almacenaje,
                transporteFiscal,
                transporteFinal,
                utilidad,
                contenedoresNecesarios,
                pesoTotalProducto,
                volumenTotalProducto,
            };
        });

        let totalGeneral = 0;
        productosConCotizacion.forEach((producto) => {
            totalGeneral += producto.totalPorUnidad * producto.cantidad;
        });

        setTotalCotizadoGeneral(totalGeneral);
        setProductosCotizados(productosConCotizacion);
        return productosConCotizacion;
    }, [productos, capacidadContenedor, impuestosFijos, almacenajeFijo, transporteFijo, utilidadFija, origen]);

    // Función para actualizar cantidad de productos
    const manejarCantidadCambio = (e, idProducto) => {
        const cantidad = parseInt(e.target.value) || 0;
        setProductosCotizados((prevState) =>
            prevState.map((producto) =>
                producto.id === idProducto ? { ...producto, cantidad } : producto
            )
        );
    };

    // Función para generar PDF con los detalles de la cotización
    const generarPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Cotización de Productos', 20, 20);

        let y = 30;
        const tablaDatos = productosCotizados.map((producto) => [
            producto.nombre,
            producto.cantidad,
            `¢${producto.impuestos.toLocaleString()}`,
            `¢${producto.almacenaje.toLocaleString()}`,
            `¢${producto.transporteFiscal.toLocaleString()}`,
            `¢${producto.transporteFinal.toLocaleString()}`,
            `¢${producto.utilidad.toLocaleString()}`,
            `¢${producto.totalPorUnidad.toFixed(2).toLocaleString()}`,
            `¢${(producto.totalPorUnidad * producto.cantidad).toFixed(2).toLocaleString()}`,
            `Contenedores: ${producto.contenedoresNecesarios}`,
        ]);

        doc.autoTable({
            startY: y,
            head: [['Producto', 'Cantidad', 'Impuestos', 'Almacenaje', 'Transporte', 'Utilidad', 'Total por Unidad', 'Total Cotizado', 'Contenedores']],
            body: tablaDatos,
            theme: 'grid',
            margin: { top: 10 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 0: { fontStyle: 'bold' } },
        });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Ingeniería de Software IV, Equipo 6', 20, y + 130);
        doc.setFontSize(8);
        doc.text('Gracias por su cotización. Para más detalles, contácte a Fabian Campos', 20, 200);

        doc.save('cotizacion.pdf');
    };

    // Formulario de configuración de parámetros
    const formik = useFormik({
        initialValues: {
            almacenajeFijo,
            transporteFijo,
            utilidadFija,
            capacidadPeso: capacidadContenedor.peso,
            capacidadVolumen: capacidadContenedor.volumen,
        },
        onSubmit: (values) => {
            setAlmacenajeFijo(values.almacenajeFijo);
            setTransporteFijo(values.transporteFijo);
            setUtilidadFija(values.utilidadFija);
            setCapacidadContenedor({ peso: values.capacidadPeso, volumen: values.capacidadVolumen });
        },
    });

    useEffect(() => {
        if (productos.length > 0) {
            const productosConCotizacion = calcularCotizacion();
            setProductosCotizados(productosConCotizacion);
        }
    }, [productos, almacenajeFijo, transporteFijo, utilidadFija, capacidadContenedor, origen, calcularCotizacion]);

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
            <Typography variant="h4" align="center" gutterBottom>Cotización</Typography>

            {/* Formulario para parámetros */}
            <form onSubmit={formik.handleSubmit}>
                <FormControl fullWidth style={{ marginBottom: '10px' }}>
                    <InputLabel>Origen</InputLabel>
                    <Select
                        name="origen"
                        value={origen}
                        onChange={(e) => setOrigen(e.target.value)}
                    >
                        <MenuItem value="Latinoamérica">Latinoamérica</MenuItem>
                        <MenuItem value="Europa">Europa</MenuItem>
                        <MenuItem value="Asia">Asia</MenuItem>
                    </Select>
                </FormControl>

                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Actualizar Parámetros
                </Button>
            </form>

            {/* Tabla de productos */}
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell>Cantidad</TableCell>
                            <TableCell>Precio Unitario</TableCell>
                            <TableCell>Impuestos</TableCell>
                            <TableCell>Almacenaje</TableCell>
                            <TableCell>Transporte Fiscal</TableCell>
                            <TableCell>Utilidad</TableCell>
                            <TableCell>Total por Unidad</TableCell>
                            <TableCell>Total Cotizado</TableCell>
                            <TableCell>Contenedores Necesarios</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productosCotizados.map((producto) => (
                            <TableRow key={producto.id}>
                                <TableCell>{producto.nombre}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={producto.cantidad}
                                        onChange={(e) => manejarCantidadCambio(e, producto.id)}
                                    />
                                </TableCell>
                                <TableCell>{`¢${producto.precio.toLocaleString()}`}</TableCell>
                                <TableCell>{`¢${producto.impuestos.toLocaleString()}`}</TableCell>
                                <TableCell>{`¢${producto.almacenaje.toLocaleString()}`}</TableCell>
                                <TableCell>{`¢${producto.transporteFiscal.toLocaleString()}`}</TableCell>
                                <TableCell>{`¢${producto.utilidad.toLocaleString()}`}</TableCell>
                                <TableCell>{`¢${producto.totalPorUnidad.toLocaleString()}`}</TableCell>
                                <TableCell>{`¢${(producto.totalPorUnidad * producto.cantidad).toFixed(2).toLocaleString()}`}</TableCell>
                                <TableCell>{producto.contenedoresNecesarios}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Total General */}
            <Typography variant="h5" style={{ marginTop: '20px' }}>
                Total General: ¢{totalCotizadoGeneral.toLocaleString()}
            </Typography>

            {/* Botón para generar el PDF */}
            <Button variant="contained" color="primary" onClick={generarPDF} style={{ marginTop: '20px' }}>
                Generar PDF
            </Button>
        </div>
    );
};

export default Cotizador;
