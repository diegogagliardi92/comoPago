# ¿Con qué pago?

Web app estática (PWA) que te dice con qué tarjeta o billetera conviene pagar según el rubro, la tienda, el día y lo que te queda de cada tope de reintegro.

## Cómo funciona

- `index.html`: la app completa (HTML + CSS + JS, sin build).
- `promos.json`: catálogo de promos. Es la fuente de datos; una rutina de Claude la revisa cada 3 días y abre un PR con los cambios.
- `local-db.js`: guarda en el navegador tus compras registradas, los medios que tenés y los cambios que hagas a las promos desde la app.
- `sw.js` + `manifest.webmanifest`: permiten instalarla en el celular y usarla sin conexión.

Los datos que cargás desde la app quedan **en ese dispositivo** (localStorage). No se sincronizan entre el celular y la PC.

## Formato de una promo

```json
{
  "id": "nx-jumbo",
  "medio": "Naranja X",
  "rubro": "Supermercados",       // "*" = cualquier rubro (tarjetas generales)
  "donde": ["Jumbo"],             // ["*"] = todas las tiendas del rubro
  "dias": [5, 6, 0],              // 0=Dom ... 6=Sáb; [] = todos los días
  "fechas": ["2026-09-10"],       // opcional: solo esas fechas puntuales
  "pct": 0.3,                     // 30%
  "tope": 12000,                  // tope de reintegro en $, null = sin tope
  "periodo": "semana",            // "dia" | "semana" | "mes" | null
  "minimo": 0,                    // compra mínima
  "costo": 0,                     // costo extra (ej. spread cripto), 0.0075 = 0,75%
  "grupo": "nx-epico",            // opcional: promos que comparten el mismo tope
  "desde": "2026-10-01",          // opcional: empieza a valer ese día
  "vence": "2026-09-30",
  "nota": "Plan Épico."
}
```

## Publicar con GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
Publicado en **https://diegogagliardi92.github.io/comoPago/**

## Instalar en el celular

Abrí el sitio en Chrome (Android) → menú ⋮ → *Agregar a pantalla principal*.
En iPhone: Safari → Compartir → *Agregar a inicio*.
