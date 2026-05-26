# FoodStore — Panel de Administración

Panel de administración para la gestión de una aplicación de pedidos de comida. Construido con React, TypeScript y Tailwind CSS, consume la API REST del backend FastAPI.

## Tecnologías

- **React 19** + **TypeScript**
- **Vite** — bundler y servidor de desarrollo
- **Tailwind CSS v4** — estilos
- **TanStack Query v5** — manejo de estado de servidor
- **Axios** — cliente HTTP con soporte a cookie HTTPOnly
- **React Router DOM v7** — navegación y rutas protegidas
- **Zustand** — estado global de autenticación

## Requisitos previos

- Node.js 18 o superior
- El backend (FastAPI) corriendo en `http://localhost:8000`

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd admin-app-food-store-final-
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Copiá el archivo de ejemplo y renombralo a `.env`:

```bash
cp .envExample .env
```

Abrí `.env` y ajustá la URL si el backend corre en otro puerto:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Levantar el servidor de desarrollo

```bash
pnpm run dev
```

La app queda disponible en `http://localhost:5173`.

## Credenciales de prueba

El backend debe tener corrido el seed para que estos usuarios existan:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@foodstore.com | (la del seed) |
| Gestor de Stock | stock@foodstore.com | (la del seed) |
| Gestor de Pedidos | pedidos@foodstore.com | (la del seed) |

## Roles y permisos

| Módulo | ADMIN | STOCK | PEDIDOS |
|--------|-------|-------|---------|
| Dashboard | ✅ | ✅ | ✅ |
| Categorías | ✅ | ❌ | ❌ |
| Ingredientes | ✅ | ❌ | ❌ |
| Productos (CRUD completo) | ✅ | ❌ | ❌ |
| Productos (stock y disponibilidad) | ✅ | ✅ | ❌ |
| Pedidos (ver y cambiar estado) | ✅ | ❌ | ✅ |

## Estructura del proyecto

```
src/
├── api/              # Funciones de llamadas a la API (Axios)
├── components/
│   └── layout/       # AppLayout, Sidebar, AdminHeader, AuthLayout
├── hooks/            # useForm, useNotification
├── modules/          # Módulos por feature
│   ├── auth/
│   ├── categorias/
│   ├── dashboard/
│   ├── ingredientes/
│   ├── pedidos/
│   └── productos/
├── router/           # AppRouter, ProtectedRoutes, rutas
├── store/            # useAuthStore (Zustand)
├── types/            # Interfaces TypeScript por entidad
└── ui/               # Componentes reutilizables (StatCard, Pagination, etc.)
```

## Video de presentación

Link al video explicativo del proyecto:

https://youtu.be/4odNGl1uBh0
