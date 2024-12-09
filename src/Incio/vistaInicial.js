import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import cotizadorlogo from '../assets/cotizador.png'; 


const VistaInicial = () => {
  const navigate = useNavigate();

  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5', // Fondo suave para todas las vistas
        textAlign: 'center',
        padding: 3, // Añade padding para que no quede tan pegado al borde
      }}
    >
      {/* Logo de la empresa */}
      <img 
        src={cotizadorlogo} 
        alt="Logo Cotizador" 
        style={{ width: '200px', marginBottom: '120px' }} // Ajusta el tamaño del logo
      />
        
      {/* Título de bienvenida */}
      <Typography variant="h3" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontSize: '3rem' }}>
        Bienvenido al Sistema Cotizador de Productos
      </Typography>
      
      {/* Subtítulo */}
      <Typography variant="subtitle1" sx={{ marginBottom: 9, fontSize: '1.5rem', fontFamily: 'Poppins, sans-serif' }}>
        Seleccione una de las siguientes opciones para continuar.
      </Typography>

      {/* Botones para navegar */}
      <Box sx={{ display: 'flex', gap: 6 }}>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={() => navigate('/catalogo')} 
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1.50rem',
            padding: '10px 20px',
            backgroundColor: '#1976d2', // Color del botón (ajustable)
            '&:hover': {
              backgroundColor: '#1565c0', // Color al pasar el mouse por encima
            }
          }}
        >
          Ir a Catálogo de Productos
        </Button>

        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/productos')} 
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1rem',
            padding: '10px 20px',
            backgroundColor: '#4caf50', // Color del botón (ajustable)
            '&:hover': {
              backgroundColor: '#388e3c', // Color al pasar el mouse por encima
            }
          }}
        >
          Ver Productos
        </Button>
      </Box>
    </Box>
  );
};

export default VistaInicial;