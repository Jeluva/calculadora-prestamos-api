'use strict';
const test = require('node:test');
const assert = require('node:assert');
const f = require('../src/finanzas');

test('cuota francesa conocida', () => {
  // 100000 a 12 cuotas al 2% mensual => 9456.00 aprox
  assert.strictEqual(f.cuota({ capital: 100000, tasaMensual: 2, cuotas: 12 }).cuota, 9455.96);
});

test('tasa 0 divide en partes iguales', () => {
  assert.strictEqual(f.cuota({ capital: 1200, tasaMensual: 0, cuotas: 12 }).cuota, 100);
});

test('la amortización termina en saldo 0', () => {
  const { tabla } = f.amortizacion({ capital: 50000, tasaMensual: 3, cuotas: 24 });
  assert.strictEqual(tabla.length, 24);
  assert.strictEqual(tabla[23].saldo, 0);
});

test('interés compuesto con aportes', () => {
  assert.strictEqual(f.interesCompuesto({ capital: 1000, tasaMensual: 1, meses: 2 }).montoFinal, 1020.1);
});

test('TNA 36% => 3% mensual', () => {
  assert.strictEqual(f.convertirTasa({ tipo: 'tna', valor: 36 }).mensual, 3);
});

test('valida entradas', () => {
  assert.throws(() => f.cuota({ capital: -5, tasaMensual: 1, cuotas: 3 }), f.ErrorDeValidacion);
});
