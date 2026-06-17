# Food Store — Panel de Administración

Panel de administración con React + TypeScript + Vite.

> Parte del proyecto Food Store TPI Programación 4.
> Repos relacionados: [Backend](https://github.com/LfgLeonardoGomez/tpPrimerParcial-app-fullstack) · [Tienda Cliente](https://github.com/LfgLeonardoGomez/store-app-food-store-final)

---

## Integrantes

| Nombre | Apellido |
|--------|----------|
| Leonardo | Gómez |
| Nicolás | Castro |

---

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| **React 19 + TypeScript** | UI y lógica de componentes |
| **Vite** | Build tool y dev server |
| **Tailwind CSS** | Estilos utility-first |
| **TanStack Query** | Fetching y caché de datos del servidor |
| **Zustand** | Estado global (auth, WebSocket) |
| **Axios** | Cliente HTTP con interceptores JWT |
| **Chart.js** | Gráficos del dashboard |
| **WebSocket** | Feed en tiempo real de pedidos |
| **Cloudinary** | Upload de imágenes de productos y categorías |

---

## Requisitos

- Node.js 18+
- pnpm
- Backend corriendo en `http://localhost:8000`

---

## Setup

```bash
cp .env.example .env

pnpm install
pnpm dev

Disponible en http://localhost:5173

---
Roles disponibles

┌─────────┬──────────────────────────────────────────────────────┐
│   Rol   │                        Acceso                        │
├─────────┼──────────────────────────────────────────────────────┤
│ ADMIN   │ Dashboard, CRUD completo, gestión de pedidos y stock │
├─────────┼──────────────────────────────────────────────────────┤
│ STOCK   │ Actualizar stock y disponibilidad de productos       │
├─────────┼──────────────────────────────────────────────────────┤
│ PEDIDOS │ Avanzar estados de pedidos (cajero y cocinero)       │
└─────────┴──────────────────────────────────────────────────────┘

Credenciales seed: ver README del Backend (https://github.com/LfgLeonardoGomez/tpPrimerParcial-app-fullstack).

---
```
## Video de presentación
[Video](https://youtu.be/SkHezWvJIcg)
