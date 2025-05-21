
# 🧠 TaskProX - Backend

Bienvenido al backend de **TaskProX**, una herramienta de gestión de tareas y proyectos colaborativos desarrollada con **FastAPI** y **MongoDB**.

---

## 📦 Tecnologías utilizadas

- **FastAPI** – Framework web moderno y rápido para APIs con Python
- **MongoDB + Motor** – Base de datos NoSQL con controlador asincrónico
- **Pydantic** – Validación y definición de modelos
- **JWT (JSON Web Tokens)** – Autenticación segura
- **Passlib (bcrypt)** – Hashing de contraseñas
- **python-dotenv** – Manejo de variables de entorno
- **Dateutil & Timezone** – Manipulación segura de fechas en UTC

---

## 📁 Estructura del proyecto

```plaintext
backend/
├── config/             # Configuraciones generales (JWT, email, DB)
├── models/             # Modelos Pydantic
├── routes/             # Endpoints organizados (auth, tasks, projects)
├── services/           # Lógica de negocio por dominio
├── main.py             # Punto de entrada FastAPI
├── .env.example        # Variables de entorno ejemplo
├── requirements.txt    # Dependencias
```

---

## 🚀 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/AlexandroTellez/TaskProX
cd TASK APP/backend
```

2. Crea un entorno virtual e instala dependencias:

```bash
python -m venv venv
source venv/bin/activate  # En Linux/macOS # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Copia y edita el archivo de entorno:

```bash
cp .env.example .env
```

4. Ejecuta el servidor:

```bash
uvicorn main:app --reload
```

---

## ⚙️ Variables de entorno requeridas

| Variable       | Descripción                           |
|----------------|---------------------------------------|
| `MONGO_URL`    | URL de conexión a MongoDB Atlas |
| `SECRET_KEY`   | Clave secreta para JWT                |
| `ALGORITHM`    | Algoritmo de cifrado (e.g. HS256)     |
| `FRONTEND_URL` | URL base del frontend (para CORS)     |

---

## 🔐 Autenticación

Todos los endpoints protegidos requieren un JWT en la cabecera:

```http
Authorization: Bearer <token>
```

Obtén el token mediante el endpoint de login (`/auth/login`).

---

## 📌 Endpoints principales

| Método | Endpoint               | Descripción                       |
|--------|------------------------|-----------------------------------|
| POST   | `/auth/register`       | Registrar un nuevo usuario        |
| POST   | `/auth/login`          | Login y obtención de token JWT    |
| GET    | `/auth/me`             | Obtener perfil del usuario actual |
| PUT    | `/auth/profile`        | Actualizar perfil                 |
| POST   | `/auth/forgot-password`| Solicitar cambio de contraseña    |
| POST   | `/auth/reset-password` | Restablecer contraseña            |
| GET    | `/api/tasks`           | Listar tareas con filtros         |
| POST   | `/api/tasks`           | Crear una nueva tarea             |
| PUT    | `/api/tasks/{id}`      | Editar tarea                      |
| DELETE | `/api/tasks/{id}`      | Eliminar tarea                    |
| GET    | `/api/projects`        | Listar proyectos                  |
| POST   | `/api/projects`        | Crear proyecto                    |
| PUT    | `/api/projects/{id}`   | Actualizar proyecto               |
| DELETE | `/api/projects/{id}`   | Eliminar proyecto                 |

---

## 📚 Documentación interactiva

- Swagger UI: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- Redoc: [`http://localhost:8000/redoc`](http://localhost:8000/redoc)

---


---

## 🧑‍💻 Autor

Proyecto desarrollado por **Alexandro Tellez**
[GitHub](https://github.com/AlexandroTellez)

---
