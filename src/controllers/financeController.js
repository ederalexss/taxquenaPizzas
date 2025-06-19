import { loadFinanzas, saveFinanzas } from '../api/storage.js';
import { renderizarFinanzas } from '../ui/financeView.js';

export function renderFinances() {
  renderizarFinanzas(loadFinanzas());
}

export function initFinances() {
  renderFinances();
  document.getElementById('formFinanzas').addEventListener('submit', e => {
    e.preventDefault();
    registrarFinanza();
  });
}

function registrarFinanza() {
  const tipoEl = document.querySelector('input[name="tipo"]:checked');
  const montoEl = document.getElementById('monto');
  const descEl = document.getElementById('descripcionFinanza');
  if (!tipoEl || !montoEl.value || !descEl.value.trim()) {
    return Swal.fire({ icon: 'warning', title: 'Completa todos los campos de finanzas.' });
  }
  const nuevo = {
    tipo: tipoEl.value,
    monto: parseFloat(montoEl.value),
    descripcion: descEl.value.trim(),
    fecha: new Date().toLocaleDateString()
  };
  const finanzas = loadFinanzas();
  finanzas.push(nuevo);
  saveFinanzas(finanzas);
  renderizarFinanzas(finanzas);
  document.getElementById('formFinanzas').reset();
  Swal.fire({ icon: 'success', title: 'Registro de finanzas agregado.' });
}
