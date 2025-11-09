# 🛍️ Portal de Productos

Aplicación web desarrollada con Node.js, Express, MongoDB y Socket.IO que permite la gestión de productos y la comunicación en tiempo real entre usuarios mediante un chat persistente.

Incluye autenticación JWT, subida de imágenes, y control de roles (admin / usuario normal).
El diseño está pensado para ser simple, funcional y fácilmente ampliable.

## 📌 Descripción general

El Portal de Productos es una aplicación web donde:

- Los usuarios pueden registrarse e iniciar sesión.
- Los administradores pueden crear, editar, eliminar y visualizar productos.
- Los usuarios normales pueden ver los productos disponibles.
- Todos los usuarios autenticados pueden participar en un chat en tiempo real que guarda los mensajes en MongoDB.

## 👩‍💻 Usuario administrador por defecto

Para acceder con permisos de administrador:

| Campo | Valor |
|-------|-------|
| Correo electrónico: | lydia@example.com |
| Contraseña: | 1234 |

Este usuario puede gestionar productos y acceder al chat.

## ⚙️ Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js 
- MongoDB en local (o una conexión en la nube)
- npm (gestor de paquetes de Node)

## 🚀 Instrucciones de instalación y ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone <URL-del-repositorio>
cd portal-productos
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto con este contenido:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/portal-products
JWT_SECRET=clave_super_segura
```

### 4️⃣ Iniciar el servidor

Modo desarrollo (recarga automática con nodemon):
```bash
npm run dev
```

Modo normal:
```bash
npm start
```

Cuando el servidor esté activo, deberías ver en la consola:
```
✅ Servidor corriendo en el puerto 3000
✅ Conectado a MongoDB
```

## 🌐 Acceder a la aplicación

Una vez el servidor esté ejecutándose correctamente, abre tu navegador y entra en:

👉 http://localhost:3000

## 🧭 Guía de uso

### 🔐 1. Registro e inicio de sesión

- Los usuarios pueden registrarse con su nombre, correo y contraseña.
- Una vez registrados, pueden iniciar sesión y acceder a la aplicación.
- El token JWT se guarda en el localStorage del navegador.

### 🛒 2. Panel de productos

Los usuarios admin pueden:

- Crear nuevos productos con nombre, descripción, precio y stock.
- Editar o eliminar productos existentes.
- Visualizar todos los productos en la lista principal.

Los usuarios normales solo pueden visualizar los productos.

### 💬 3. Chat en tiempo real

- Accesible desde el botón "💬 Ir al chat en tiempo real".
- Los usuarios pueden enviar y recibir mensajes en tiempo real.
- Los mensajes se guardan en la base de datos con fecha, hora y autor.
- Si se cierra y vuelve a abrir el chat, el historial se conserva.

## 🧱 Estructura del proyecto
```
src/
│
├── server.js                # Servidor principal (Express + Socket.IO)
├── config.js                # Variables de entorno (puerto, MongoDB, etc.)
│
├── models/
│   ├── User.js              # Modelo de usuario (nombre, email, contraseña, rol)
│   ├── Product.js           # Modelo de producto (nombre, descripción, precio, imagen)
│   └── ChatMessage.js       # Modelo de mensajes del chat
│
├── routes/
│   ├── authRoutes.js        # Registro e inicio de sesión
│   ├── productRoutes.js     # CRUD de productos con subida de imágenes
│   └── chatRoutes.js        # (Reservado para futuras ampliaciones)
│
├── middleware/
│   └── authenticateJWT.js   # Middleware para validar tokens
│
└── public/
    ├── index.html           # Página de login
    ├── register.html        # Página de registro
    ├── products.html        # Portal principal de productos
    ├── chat.html            # Chat en tiempo real
    ├── styles.css           # Estilos generales
  
```

## 🔧 Funcionalidades clave

### 👤 Sistema de usuarios

- Registro e inicio de sesión con validación.
- Tokens JWT firmados con JWT_SECRET.
- Control de acceso por roles (admin / user).

### 📦 Gestión de productos

- CRUD completo (crear, leer, actualizar, eliminar).
- Los productos se guardan en MongoDB.

### 💬 Chat persistente

- Chat global con Socket.IO.
- Autenticación por token.
- Mensajes persistentes en MongoDB.
- Visualización del historial por fecha.

## 🧠 Decisiones de desarrollo

### 🔹 1. Estructura modular

Se ha separado el proyecto en carpetas (models, routes, middleware, public) para mantener una arquitectura clara, escalable y mantenible.

### 🔹 2. Autenticación con JWT

Se ha optado por JSON Web Tokens en lugar de sesiones, ya que permite un flujo sin estado y más adecuado para APIs REST.

### 🔹 3. Chat con Socket.IO

El chat se implementó con Socket.IO, permitiendo comunicación bidireccional y validación del usuario a través del token JWT.

### 🔹 4. Persistencia de mensajes

Los mensajes del chat se guardan en MongoDB con marca de tiempo (createdAt), mostrando separadores de fecha cuando cambia el día.


### 🔹 5. Interfaz simple y funcional

El frontend usa HTML, CSS y JavaScript nativo, priorizando la claridad del código sobre el diseño visual.
Esto facilita la evaluación y comprensión del flujo completo (frontend–backend–base de datos).

### 🔹 6. Control de acceso basado en roles

Los administradores pueden acceder a las rutas protegidas del CRUD de productos.
Esto se valida tanto en el frontend como en el backend mediante middlewares.

