export const primeraLetraMayuscula = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Función para formatear el precio
export const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(precio);
  };
  

