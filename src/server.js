'use strict';
const http = require('node:http');
const f = require('./finanzas');

const RUTAS = {
  '/cuota': f.cuota,
  '/amortizacion': f.amortizacion,
  '/interes-compuesto': f.interesCompuesto,
  '/convertir-tasa': f.convertirTasa,
};

function responder(res, status, cuerpo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(cuerpo));
}

function leerJson(req) {
  return new Promise((resolve, reject) => {
    let datos = '';
    req.on('data', (c) => {
      datos += c;
      if (datos.length > 1e5) { reject(new f.ErrorDeValidacion('Cuerpo demasiado grande')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(datos ? JSON.parse(datos) : {}); }
      catch { reject(new f.ErrorDeValidacion('JSON inválido')); }
    });
  });
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/' || url.pathname === '/health') {
    return responder(res, 200, { ok: true, endpoints: Object.keys(RUTAS).map((r) => `POST|GET ${r}`) });
  }
  const handler = RUTAS[url.pathname];
  if (!handler) return responder(res, 404, { error: 'Ruta no encontrada' });
  try {
    let params;
    if (req.method === 'GET') params = Object.fromEntries(url.searchParams);
    else if (req.method === 'POST') params = await leerJson(req);
    else return responder(res, 405, { error: 'Método no permitido' });
    responder(res, 200, handler(params));
  } catch (e) {
    if (e instanceof f.ErrorDeValidacion) return responder(res, 400, { error: e.message });
    console.error(e);
    responder(res, 500, { error: 'Error interno' });
  }
});

// Cloud Run inyecta PORT
const puerto = process.env.PORT || 8080;
if (require.main === module) {
  servidor.listen(puerto, () => console.log(`Escuchando en :${puerto}`));
}
module.exports = servidor;
