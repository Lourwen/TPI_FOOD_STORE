# TPI Programacion IV- Food Store

Aplicación web para la gestión de un negocio de comidas. Permite administrar usuarios, categorías y productos, consultar el catálogo, realizar pedidos y gestionar su seguimiento.

El proyecto está desarrollado con una arquitectura frontend/backend separada. El backend expone una API REST y el frontend consume sus endpoints para ofrecer una interfaz de usuario.

### Alumna: Rosa Lourdes, Paco Laura

### Link del Video: https://drive.google.com/file/d/13DxgJKVyJeV2HlIG_BWUnCWxsFCYzi2N/view?usp=sharing
## Tecnologías utilizadas

### Backend

- Python
- FastAPI
- SQLModel
- SQLite
- Pydantic Settings
- JWT para autenticación
- Passlib y bcrypt para el hash de contraseñas
- Uvicorn

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- TanStack Form
- TanStack Table
- Axios
- Zustand

## Funcionalidades

### Usuarios y autenticación

- Registro e inicio de sesión.
- Autenticación mediante tokens JWT.
- Contraseñas almacenadas mediante hash bcrypt.
- Control de acceso según el rol del usuario.
- Protección de rutas y funcionalidades administrativas.

### Catálogo y productos

- Consulta del catálogo de productos.
- Visualización y filtrado por categorías.
- Administración de productos.
- Alta, modificación, activación y desactivación de productos.
- Gestión de precios y stock.
- Indicación de productos sin stock.

### Categorías

- Listado de categorías.
- Alta y modificación.
- Activación y desactivación.
- Administración de categorías desde el panel correspondiente.

### Pedidos

- Agregar productos al carrito.
- Persistencia del carrito.
- Confirmación de pedidos.
- Consulta de los pedidos propios.
- Visualización del detalle de cada pedido.
- Cancelación de pedidos.
- Gestión administrativa de los pedidos y sus estados.

### Stock

- Descuento automático del stock al confirmar un pedido.
- Actualización del catálogo después de las operaciones.
- Restauración del stock cuando se cancela un pedido.
- Validación de disponibilidad antes de confirmar una compra.

### Panel administrativo

- Administración de usuarios.
- Administración de productos y categorías.
- Consulta y gestión de pedidos.
- Modificación de estados de pedidos.
- Visualización de información resumida de pedidos.

## Estructura del proyecto

```text
TPI_FOOD_STORE/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── base_repository.py
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── deps.py
│   │   │   ├── security.py
│   │   │   └── unit_of_work.py
│   │   │
│   │   ├── db/
│   │   │   └── seed.py
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── categorias/
│   │   │   ├── pedidos/
│   │   │   ├── productos/
│   │   │   └── usuarios/
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── features/
    │   │   ├── auth/
    │   │   ├── categorias/
    │   │   ├── pedidos/
    │   │   ├── productos/
    │   │   └── usuarios/
    │   │
    │   ├── routes/
    │   ├── shared/
    │   ├── store/
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    │
    ├── package.json
    ├── pnpm-lock.yaml
    └── .env.example
```

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Python 3.
- Node.js.
- pnpm 9.15.9.
- Un navegador web.

## Instalación y ejecución

El proyecto se ejecuta iniciando el backend y el frontend por separado.

### 1. Configurar el backend

Abrir una terminal en la carpeta raíz del proyecto y acceder a `backend`:

```powershell
cd backend
```

Crear un entorno virtual:

```powershell
python -m venv .venv
```

Activarlo:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar las dependencias:

```powershell
python -m pip install -r requirements.txt
```

Crear el archivo de configuración local a partir del ejemplo:

```powershell
Copy-Item .env.example .env
```

Si el archivo `.env` ya existe, conservarlo y verificar que tenga las variables necesarias.

La configuración de ejemplo utiliza SQLite:

```env
DATABASE_URL=sqlite:///./food_store.db
SECRET_KEY=CAMBIAR_POR_UNA_CLAVE_SEGURA_DE_AL_MENOS_32_CARACTERES
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

Se recomienda reemplazar `SECRET_KEY` por una clave propia y segura.

### 2. Inicializar la base de datos

Desde la carpeta `backend`, ejecutar:

```powershell
python -m app.db.seed
```

Este comando crea las tablas necesarias y carga los datos iniciales del sistema.

El proceso incluye:

- Usuario administrador.
- Categorías iniciales.
- Productos de ejemplo.

El seed comprueba si los registros ya existen para evitar duplicarlos al ejecutarlo nuevamente.

### 3. Iniciar el backend

Desde la carpeta `backend`, ejecutar:

```powershell
uvicorn app.main:app --reload
```

La API quedará disponible en:

`http://127.0.0.1:8000`

La documentación interactiva de los endpoints se encuentra en:

`http://127.0.0.1:8000/docs`

### 4. Configurar el frontend

Abrir una segunda terminal y acceder a la carpeta `frontend`:

```powershell
cd frontend
```

Instalar las dependencias:

```powershell
pnpm install
```

Crear el archivo de configuración local solamente si todavía no existe:

```powershell
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}
```

Si el archivo `.env` ya existe, conservarlo y verificar que tenga configurada la URL de la API.

La variable utilizada por el frontend es:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Verificar que el frontend compile correctamente:

```powershell
pnpm build
```

### 5. Iniciar el frontend

Desde la carpeta `frontend`, ejecutar:

```powershell
pnpm dev
```

La aplicación estará disponible en:

`http://localhost:5173`

## Usuario administrador inicial

El proceso de inicialización crea un usuario administrador para facilitar las pruebas del sistema.

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `Admin1234!` |
| Correo | `admin@foodstore.com` |
| Rol | `admin` |

Estas credenciales son únicamente para desarrollo y demostración. En un entorno real deben reemplazarse por credenciales propias y seguras.

## Arquitectura general

### Backend

El backend está organizado por módulos funcionales:

- `auth`: autenticación.
- `usuarios`: gestión de usuarios.
- `categorias`: gestión de categorías.
- `productos`: gestión de productos.
- `pedidos`: gestión de pedidos y sus detalles.

La carpeta `core` concentra componentes compartidos, como configuración, conexión a la base de datos, seguridad, dependencias y abstracciones de repositorio y Unit of Work.

### Frontend

El frontend está organizado por funcionalidades, componentes compartidos y administración del estado.

- `features`: contiene las funcionalidades separadas por módulo.
- `routes`: centraliza la navegación y protección de rutas.
- `shared`: reúne componentes, utilidades y configuraciones reutilizables.
- `store`: administra el estado global mediante Zustand.

TanStack Query se utiliza para gestionar las consultas y mutaciones contra la API, mientras que Axios centraliza las solicitudes HTTP.

## Notas

- El backend utiliza SQLite como base de datos en la configuración de ejemplo.
- La creación de las tablas y la carga inicial de datos se realizan mediante el comando de inicialización del seed.
- Los archivos `.env` contienen configuración local y deben mantenerse separados de los archivos de ejemplo.
- Para modificar la URL de conexión, el origen permitido del frontend o los parámetros de autenticación, editar las variables correspondientes del archivo `.env` del backend.

### Mejoras futuras

- **Control de productos duplicados:** incorporar una validación que permita advertir al administrador cuando intenta crear un producto con un nombre que ya existe en el catálogo. Esta mejora podría ayudar a evitar registros duplicados y mantener la organización del catálogo. Actualmente, el sistema permite nombres repetidos, de acuerdo con el alcance definido en la consigna.