# Veterinaria Patitas al Rescate

## Descripción del proyecto

Veterinaria Patitas al Rescate es un sistema desarrollado para facilitar la administración de una veterinaria mediante el registro de propietarios, veterinarios, servicios, citas y pagos.

En el proyecto 1 se desarrolló una API REST con Python, Django y Django REST Framework, conectada a una base de datos MySQL. En el proyecto 2 se agregó una página web con React para utilizar las funciones del sistema desde una interfaz gráfica.

La página permite iniciar sesión, consultar información y administrar registros según los permisos de cada usuario. Los datos se consultan y guardan mediante la API de Django, que mantiene las validaciones y reglas de negocio.

## Tecnologías utilizadas

**Backend**
- Python
- Django 5.2.17
- Django REST Framework 3.16.1
- MySQL
- PyMySQL 1.1.2
- python-dotenv 1.2.1
- django-cors-headers

**Frontend**
- React
- Vite
- JavaScript y JSX
- React Router
- Bootstrap 5
- Fetch API
- HTML y CSS

**Control de versiones**
- Git y GitHub

## Funcionalidades principales

El sistema está organizado en cinco módulos.

### 1. Propietarios

Permite registrar y administrar los datos de los propietarios de las mascotas, incluyendo identificación, nombre, teléfono, correo electrónico y estado.

Desde React se pueden consultar, crear, editar y eliminar propietarios, según los permisos del usuario.

### 2. Veterinarios

Permite administrar la información de los veterinarios, como identificación profesional, nombre, teléfono, correo electrónico y estado.

La página muestra los veterinarios registrados y permite realizar las operaciones correspondientes desde formularios.

### 3. Servicios

Administra los servicios que ofrece la veterinaria. Cada servicio tiene código, nombre, descripción, tipo, precio, cupos disponibles y veterinario asignado.

Desde React se pueden consultar, crear, editar y eliminar servicios. También se pueden realizar búsquedas, aplicar filtros y ordenar los registros.

### 4. Citas

Permite registrar citas de mascotas, incluyendo propietario, nombre y especie de la mascota, fechas, estado y observaciones.

Cada cita puede tener varios servicios asociados mediante el modelo `DetalleCita`.

Desde React se pueden consultar y administrar las citas. También existe una pantalla para agregar, editar o eliminar los servicios de una cita, siempre que las reglas del backend lo permitan.

Django calcula el total de los servicios, los pagos realizados y el saldo pendiente.

### 5. Pagos

Permite registrar y administrar los pagos correspondientes a las citas, incluyendo monto, fecha, método de pago y referencia.

Una cita puede tener varios pagos, siempre que se respeten las validaciones del backend. El sistema controla que los pagos no superen el saldo pendiente.

## Funcionalidades del frontend

La página web desarrollada en React incluye:

- Inicio y cierre de sesión.
- Navegación entre los cinco módulos.
- Dashboard con indicadores obtenidos de la API.
- Consulta de registros mediante tablas.
- Formularios para crear y editar información.
- Opciones para consultar detalles y eliminar registros.
- Búsquedas y filtros según el módulo.
- Ordenamiento y paginación.
- Mensajes de éxito y error.
- Confirmación antes de eliminar registros.
- Rutas protegidas según la autenticación.
- Opciones de la interfaz según los permisos del usuario.
- Diseño adaptable mediante Bootstrap 5.

Todas las operaciones principales se realizan mediante la API de Django y utilizan la base de datos del sistema.

## Requisitos para ejecutar el proyecto

Antes de comenzar, es necesario tener instalado:

- Python.
- Node.js y npm.
- MySQL y MySQL Workbench.
- Git, si se desea clonar el repositorio.
- Visual Studio Code u otro editor de código.

Las dependencias del backend se encuentran en `requirements.txt` y las del frontend en `frontend/package.json`.

## Instalación y configuración

### 1. Descargar el proyecto

Clonar el repositorio:

```powershell
git clone https://github.com/mpauvenegue-coder/Proyecto_Veterinaria_.git
```

Entrar a la carpeta:

```powershell
cd Proyecto_Veterinaria_
```

También se puede descargar el proyecto como archivo ZIP desde GitHub y extraerlo.

### 2. Crear y activar el entorno virtual

Desde la carpeta principal del proyecto, ejecutar:

```powershell
py -m venv .venv
```

Activar el entorno:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Instalar las dependencias del backend

Con el entorno virtual activado:

```powershell
python -m pip install -r requirements.txt
```

### 4. Configurar la base de datos

Abrir MySQL Workbench y crear la base de datos:

```sql
CREATE DATABASE IF NOT EXISTS veterinaria_db;
```

Crear el archivo `.env` a partir de `.env.example`:

```powershell
Copy-Item .env.example .env
```

Configurar las variables de entorno:

```env
SECRET_KEY=clave-local-para-pruebas
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

DB_ENGINE=mysql
DB_NAME=veterinaria_db
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_HOST=127.0.0.1
DB_PORT=3306
```

En `DB_PASSWORD` se debe colocar la contraseña correspondiente a la instalación local de MySQL.

El archivo `.env` contiene información de configuración local y no debe subirse al repositorio.

### 5. Aplicar las migraciones

Ejecutar:

```powershell
python manage.py migrate
```

Este comando aplica las migraciones necesarias en la base de datos.

### 6. Crear un superusuario

```powershell
python manage.py createsuperuser
```

Ingresar el nombre de usuario, correo electrónico y contraseña solicitados.

### 7. Ejecutar Django

```powershell
python manage.py runserver
```

El servidor se inicia normalmente en:

http://127.0.0.1:8000/

Para ingresar al panel administrativo:

http://127.0.0.1:8000/admin/

La terminal de Django debe permanecer abierta mientras se utiliza React.

### 8. Configurar el frontend

Abrir otra terminal y entrar a la carpeta del frontend:

```powershell
cd frontend
```

Instalar las dependencias:

```powershell
npm install
```

Este comando utiliza `package.json` y genera o actualiza `package-lock.json`.

Crear el archivo `.env` a partir de `.env.example`:

```powershell
Copy-Item .env.example .env
```

Configurar la dirección de la API:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Guardar los cambios.

### 9. Ejecutar React

Dentro de `frontend`, ejecutar:

```powershell
npm run dev
```

La página se abre normalmente desde:

http://localhost:5173/

Para comprobar la compilación del frontend también se puede ejecutar:

```powershell
npm run build
```

## Comunicación entre React y Django

React utiliza `fetch` para comunicarse con la API REST de Django.

Las solicitudes se organizan en el archivo `frontend/src/api.js`, donde se encuentra la configuración de la URL base y las funciones para realizar consultas y manejar errores.

Los métodos utilizados son:

| Método | Función |
|---|---|
| GET | Consultar información |
| POST | Crear registros |
| PATCH | Modificar registros |
| DELETE | Eliminar registros |

Cuando se realiza una operación desde React, Django recibe la solicitud, comprueba los datos y los permisos, y realiza los cambios correspondientes en MySQL.

Después de guardar, editar o eliminar registros, React vuelve a consultar la información para mostrar los cambios.

## Configuración de CORS

Se agregó `django-cors-headers` para permitir la comunicación entre React y Django durante el desarrollo.

En `settings.py` se incluye la aplicación:

```python
'corsheaders',
```

También se agrega el middleware:

```python
'corsheaders.middleware.CorsMiddleware',
```

Los orígenes permitidos para el frontend son:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
```

Esta configuración permite que React, ejecutándose en el puerto 5173, realice solicitudes a Django.

## Endpoints de la API

### Autenticación y sesión

| Método | Endpoint | Función |
|---|---|---|
| POST | `/api/token/` | Obtener token |
| GET | `/api/perfil/` | Consultar usuario, grupos y permisos |
| GET | `/api/sesion/` | Consultar información de sesión |

### Gestión de registros

| Recurso | Endpoint |
|---|---|
| Propietarios | `/api/propietarios/` |
| Veterinarios | `/api/veterinarios/` |
| Servicios | `/api/servicios/` |
| Citas | `/api/citas/` |
| Pagos | `/api/pagos/` |

Los métodos `GET` y `POST` permiten consultar y crear registros.

Para consultar, modificar o eliminar un registro específico, se utiliza su identificador:

```text
/api/propietarios/{id}/
/api/veterinarios/{id}/
/api/servicios/{id}/
/api/citas/{id}/
/api/pagos/{id}/
```

Estas rutas permiten utilizar `GET`, `PUT`, `PATCH` y `DELETE`, según los permisos y las restricciones del sistema.

### Detalles de las citas

| Método | Endpoint | Función |
|---|---|---|
| GET, POST | `/api/citas/{id}/detalles/` | Consultar o agregar servicios a una cita |
| GET, PUT, PATCH, DELETE | `/api/citas/detalles/{id}/` | Consultar, modificar o eliminar un detalle |

### Reportes

El backend incluye los siguientes reportes:

| Endpoint | Función |
|---|---|
| `/api/reportes/resumen/` | Resumen general |
| `/api/reportes/propietarios-atenciones/` | Atenciones y pagos por propietario |
| `/api/reportes/servicios-bajo-cupos/` | Servicios con pocos cupos |
| `/api/reportes/citas-propietario/{id}/` | Citas de un propietario |
| `/api/reportes/servicios-veterinario/{id}/` | Servicios de un veterinario |

Los reportes utilizan el método `GET`.

## Filtros, búsquedas y paginación

La API permite filtrar y buscar información según el módulo.

Los parámetros disponibles son:

- **Propietarios:** `activo`, `buscar`, `ordering` y `page`.
- **Veterinarios:** `activo`, `buscar` y `page`.
- **Servicios:** `tipo`, `veterinario`, `activo`, `buscar`, `ordering` y `page`.
- **Citas:** `estado`, `propietario`, `activo`, `ordering` y `page`.
- **Pagos:** `cita`, `metodo`, `activo` y `page`.

Los listados utilizan paginación de cinco registros por página.

Ejemplo:

```http
GET /api/citas/?estado=PENDIENTE&page=1
```

React utiliza estos parámetros para consultar la información correspondiente desde la API.

## Usuarios y permisos

El sistema utiliza autenticación mediante tokens y sesiones de Django.

Se manejan tres perfiles principales:

| Perfil | Consultar | Crear | Modificar | Eliminar |
|---|---|---|---|---|
| Administrador | Sí | Sí | Sí | Sí |
| Recepcionista | Sí | Sí | Sí | No |
| Consulta | Sí | No | No | No |

Los permisos se administran mediante los usuarios y grupos de Django.

El endpoint `/api/perfil/` permite obtener los datos del usuario, sus grupos y los permisos que tiene asignados.

React utiliza esta información para mostrar las opciones correspondientes a cada perfil. Sin embargo, Django es el encargado de comprobar los permisos antes de realizar cualquier operación.

Cuando se cierra sesión desde React, el token se elimina del navegador. Este cierre de sesión no revoca automáticamente el token en el servidor.

## Reglas de negocio

El backend mantiene las validaciones desarrolladas en el proyecto 1.

Entre las principales reglas se encuentran:

- Validación de campos obligatorios y valores permitidos.
- Verificación de propietarios y veterinarios activos.
- Control de cupos disponibles.
- Restricción de servicios repetidos dentro de una cita.
- Validación de fechas y estados de las citas.
- Control de pagos para evitar montos superiores al saldo.
- Actualización del estado de las citas según los pagos.
- Restricciones para modificar o eliminar registros relacionados.
- Control de permisos según el perfil del usuario.

Los formularios de React también realizan validaciones básicas antes de enviar los datos.

Las validaciones principales permanecen en Django.

## Estructura del proyecto

```text
Proyecto_Veterinaria_/
│
├── propietarios/
├── veterinarios/
├── servicios/
├── citas/
├── pagos/
├── veterinaria_backend/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Menu.jsx
│   │   │   └── Mensaje.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Inicio.jsx
│   │   │   ├── Propietarios.jsx
│   │   │   ├── Veterinarios.jsx
│   │   │   ├── Servicios.jsx
│   │   │   ├── Citas.jsx
│   │   │   ├── DetallesCita.jsx
│   │   │   └── Pagos.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .env.example
├── .gitignore
├── manage.py
├── requirements.txt
└── README.md
```

Las carpetas del backend contienen los modelos, vistas, serializadores, rutas y configuraciones correspondientes.

En el frontend, la carpeta `pages` contiene las pantallas de los módulos y `components` contiene los elementos que se utilizan en diferentes partes de la aplicación.

El archivo `App.jsx` controla la navegación y la sesión, `main.jsx` inicia React y `api.js` permite comunicarse con Django.

## Correcciones del proyecto 1

Se conservaron las correcciones realizadas al backend después de la evaluación del proyecto 1:

- El reporte de propietarios cuenta citas únicas, incluso cuando tienen varios pagos.
- Al editar un detalle con el mismo servicio, solamente se ajusta la diferencia de cupos.
- No se permite cambiar la cita asociada a un detalle.
- Los filtros de ID de veterinario, propietario y cita devuelven HTTP 400 cuando el valor no es un entero positivo. Los filtros vacíos se omiten.

Estas correcciones forman parte del backend utilizado por React.

## Integrantes

**Universidad de Costa Rica — Sede del Pacífico**

**Curso:** IF-0009 Desarrollo de Software IV

**Profesor:** Mag. Irwin Leal Elizondo

**Estudiantes:**
- Suly Daniela Bustos Medina — C5D410
- María Paula Venegas Sosa — C5K896

## Información adicional

Este proyecto fue desarrollado con fines académicos para aplicar los conocimientos adquiridos en el curso Desarrollo de Software IV.

El proyecto 1 permitió desarrollar la API REST, las validaciones, los permisos y la conexión con MySQL. En el proyecto 2 se agregó una interfaz web con React para utilizar esas funciones desde el navegador.

La comunicación entre React y Django permite mantener las reglas del backend mientras los usuarios trabajan desde una interfaz organizada en los cinco módulos del sistema.
