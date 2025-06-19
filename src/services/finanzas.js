// Cálculo de totales de finanzas: ingresos, gastos y saldo
export function calcularTotales(finanzas) {
    const ingresos = finanzas
      .filter(r => r.tipo === 'ingreso')
      .reduce((sum, r) => sum + r.monto, 0);
    const gastos = finanzas
      .filter(r => r.tipo === 'gasto')
      .reduce((sum, r) => sum + r.monto, 0);
    const total = ingresos - gastos;
    return { ingresos, gastos, total };
  }
  