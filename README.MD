TAREAS:

- GENERAL

  - | Tarea                | Descripción                                                                   | Estado        |
    | -------------------- | ----------------------------------------------------------------------------- | ------------- |
    | Autorización         | Continuar con autorización de rutas, hacer prueba piloto (passport call)      | **Pendiente** |
    | Roles                | Manejar roles para las rutas protegidas (incluir en controller en lo posible) | **Pendiente** |
    | Validación de campos | Limitar cantidad y tipo de caracteres admitidos por lo campos (Seguridad)     | **Pendiente** |

# Proyecto de Node.js - Gestión de Usuarios

## Descripción

Este proyecto es una aplicación backend desarrollada en Node.js con Express y MongoDB. Está diseñado para gestionar usuarios, permitiendo funcionalidades como la creación de nuevos usuarios y el inicio de sesión.

## Tecnologías

- **Node.js**
- **Express**
- **MongoDB** con Mongoose
- **JavaScript (ES Modules)**

## Estructura del Proyecto

```
MGD Beta Backend/
├── config/
│ ├── config.js
│ ├── passport.config.js
├── controllers/
│ ├── auth.controller.js
│ ├── user.controller.js
├── errors/
│ ├── CustomError.js
│ ├── enums.js
│ ├── info.js
├── models/
│ ├── user.model.js
├── routers/
│ ├── auth.router.js
│ ├── user.router.js
├── utils/
│ ├── auth.js
│ ├── logger.js
├── app.js
├── package.json
└── README.md
```

## Estructura de Archivos

- **user.model.js**: Define el modelo `User` utilizando Mongoose.
- **auth.router.js**: Gestiona las rutas relacionadas con la autenticación (inicio de sesión).
- **user.router.js**: Gestiona las rutas para las operaciones CRUD de usuarios.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <URL-del-repositorio>
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:

   - Asegúrate de configurar tu conexión a MongoDB en un archivo `.env`.

   Ejemplo:

   ```env
   MONGO_URI=mongodb://localhost:27017/miBaseDeDatos
   PORT=3000
   ```

## Ejecución

### Modo Desarrollo

Para iniciar el proyecto en modo desarrollo, ejecuta:

```bash
npm run dev
```

### Modo Producción

Para iniciar el proyecto en producción:

```bash
npm start
```

## Endpoints Principales

### Autenticación

- **POST /login**: Permite a los usuarios iniciar sesión.
  - **Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```

### Gestión de Usuarios

- **GET /user**: Obtiene una lista de todos los usuarios.
- **POST /user**: Crea un nuevo usuario.
  - **Body**:
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "userName": "johndoe",
      "email": "john.doe@example.com",
      "role": "admin",
      "password": "securepassword"
    }
    ```

## Validaciones

Este proyecto incluye validaciones para la creación de usuarios, asegurando que los datos ingresados cumplan con los requisitos esperados.

## Contribución

Si deseas contribuir:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tus cambios:
   ```bash
   git checkout -b mi-nueva-funcionalidad
   ```
3. Realiza tus cambios y haz un commit:
   ```bash
   git commit -m "Agrego nueva funcionalidad"
   ```
4. Envía un pull request.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.
