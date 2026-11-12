# calculadora-prestamos-api

API chica en Node.js (sin dependencias) con cálculos financieros básicos. **Es un proyecto de práctica** para mi portfolio, pensado para correr en Google Cloud Run. No es asesoramiento financiero: las fórmulas son las estándar, pero no contempla impuestos, seguros ni gastos de otorgamiento.

## Qué hace

| Endpoint | Qué calcula | Parámetros |
|---|---|---|
| `/cuota` | Cuota fija (sistema francés), total e interés total | `capital`, `tasaMensual` (%), `cuotas` |
| `/amortizacion` | Tabla cuota por cuota (interés, capital, saldo) | igual que `/cuota` |
| `/interes-compuesto` | Monto final con aporte mensual opcional | `capital`, `tasaMensual` (%), `meses`, `aporteMensual` |
| `/convertir-tasa` | Convierte entre TNA, TEA y tasa mensual | `tipo` (`tna`, `tea`, `mensual`), `valor` (%) |

Acepta `GET` con query string o `POST` con JSON. Los errores de validación devuelven `400` con un mensaje.

## Correrlo local

Requiere Node 20 o superior.

```bash
npm start            # escucha en el puerto 8080 (o en $PORT)
npm test             # tests con el runner nativo de Node

curl 'localhost:8080/cuota?capital=100000&tasaMensual=2&cuotas=12'
# {"cuota":9455.96,"totalAPagar":113471.52,"interesTotal":13471.52}

curl 'localhost:8080/convertir-tasa?tipo=tea&valor=60'
# {"tna":47.9329,"tea":60,"mensual":3.9944}
```

## Desplegar en Cloud Run

Hay un `Dockerfile` y el server lee `PORT`, como pide Cloud Run:

```bash
gcloud run deploy calculadora-prestamos-api --source . --region us-central1 --allow-unauthenticated
```

Nota: probé la API y los tests en local; el deploy a Cloud Run no lo ejecuté desde acá.

## Estructura

- `src/finanzas.js`: funciones de cálculo y validación
- `src/server.js`: servidor HTTP con el módulo `http` de Node
- `test/`: tests de las fórmulas
