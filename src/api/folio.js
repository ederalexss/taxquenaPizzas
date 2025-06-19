// genera y persiste el folio incremental de pedidos
export function generarFolio() {
    let ultimoFolio = parseInt(localStorage.getItem('folioPedido') || '0', 10);
    ultimoFolio++;
    const folio = `PED-${ultimoFolio.toString().padStart(4, '0')}`;
    localStorage.setItem('folioPedido', ultimoFolio);
    return folio;
  }
  