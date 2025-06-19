// lectura / escritura en localStorage de pedidos y finanzas
export function loadPedidos() {
    return JSON.parse(localStorage.getItem('pedidos')) || [];
  }
  export function savePedidos(pedidos) {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
  }
  
  export function loadFinanzas() {
    return JSON.parse(localStorage.getItem('finanzas')) || [];
  }
  export function saveFinanzas(finanzas) {
    localStorage.setItem('finanzas', JSON.stringify(finanzas));
  }
  