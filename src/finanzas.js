'use strict';

const redondear = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

class ErrorDeValidacion extends Error {}

function numero(valor, nombre, { min = -Infinity, minExclusivo = false } = {}) {
  const n = Number(valor);
  if (valor === undefined || valor === null || valor === '' || !Number.isFinite(n)) {
    throw new ErrorDeValidacion(`"${nombre}" es obligatorio y debe ser un número`);
  }
  if (minExclusivo ? n <= min : n < min) {
    throw new ErrorDeValidacion(`"${nombre}" debe ser ${minExclusivo ? 'mayor que' : 'al menos'} ${min}`);
  }
  return n;
}

// Cuota fija del sistema francés. tasaMensual en porcentaje (ej: 3 = 3% mensual).
function cuota({ capital, tasaMensual, cuotas }) {
  const P = numero(capital, 'capital', { min: 0, minExclusivo: true });
  const i = numero(tasaMensual, 'tasaMensual', { min: 0 }) / 100;
  const n = numero(cuotas, 'cuotas', { min: 1 });
  if (!Number.isInteger(n)) throw new ErrorDeValidacion('"cuotas" debe ser entero');
  const valor = i === 0 ? P / n : (P * i) / (1 - Math.pow(1 + i, -n));
  return {
    cuota: redondear(valor),
    totalAPagar: redondear(valor * n),
    interesTotal: redondear(valor * n - P),
  };
}

// Tabla de amortización completa (sistema francés).
function amortizacion(params) {
  const { cuota: c } = cuota(params);
  const i = Number(params.tasaMensual) / 100;
  const n = Number(params.cuotas);
  let saldo = Number(params.capital);
  const tabla = [];
  for (let k = 1; k <= n; k++) {
    const interes = saldo * i;
    // la última cuota cancela el saldo exacto para evitar residuos de redondeo
    const capitalPagado = k === n ? saldo : c - interes;
    saldo -= capitalPagado;
    tabla.push({
      cuota: k,
      pago: redondear(capitalPagado + interes),
      interes: redondear(interes),
      capital: redondear(capitalPagado),
      saldo: redondear(Math.max(saldo, 0)),
    });
  }
  return { cuota: c, tabla };
}

// Interés compuesto con aporte mensual opcional (al final de cada mes).
function interesCompuesto({ capital, tasaMensual, meses, aporteMensual = 0 }) {
  const P = numero(capital, 'capital', { min: 0 });
  const i = numero(tasaMensual, 'tasaMensual', { min: 0 }) / 100;
  const n = numero(meses, 'meses', { min: 1 });
  const a = numero(aporteMensual, 'aporteMensual', { min: 0 });
  if (!Number.isInteger(n)) throw new ErrorDeValidacion('"meses" debe ser entero');
  let monto = P;
  for (let k = 0; k < n; k++) monto = monto * (1 + i) + a;
  const aportado = P + a * n;
  return { montoFinal: redondear(monto), totalAportado: redondear(aportado), ganancia: redondear(monto - aportado) };
}

// Conversión entre TNA (capitaliza mensual), TEA y tasa mensual. Todo en %.
function convertirTasa({ tipo, valor }) {
  const v = numero(valor, 'valor', { min: 0 }) / 100;
  let mensual;
  if (tipo === 'tna') mensual = v / 12;
  else if (tipo === 'tea') mensual = Math.pow(1 + v, 1 / 12) - 1;
  else if (tipo === 'mensual') mensual = v;
  else throw new ErrorDeValidacion('"tipo" debe ser "tna", "tea" o "mensual"');
  const pct = (x) => Math.round(x * 100 * 10000) / 10000;
  return { tna: pct(mensual * 12), tea: pct(Math.pow(1 + mensual, 12) - 1), mensual: pct(mensual) };
}

module.exports = { cuota, amortizacion, interesCompuesto, convertirTasa, ErrorDeValidacion };
