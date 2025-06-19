import { calcularTotales } from '../services/finanzas.js';

export function renderizarFinanzas(finanzas) {
  const tabla = document.getElementById('tablaFinanzas');
  tabla.innerHTML = '';
  finanzas.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.tipo}</td>
      <td>$${r.monto.toFixed(2)}</td>
      <td>${r.descripcion}</td>
      <td>${r.fecha}</td>`;
    tabla.appendChild(tr);
  });
  const { ingresos, gastos, total } = calcularTotales(finanzas);
  document.getElementById('totalesFinanzas').innerHTML = `
    <p>Ingresos: $${ingresos.toFixed(2)}</p>
    <p>Gastos: $${gastos.toFixed(2)}</p>
    <p>Total: $${total.toFixed(2)}</p>`;
}
