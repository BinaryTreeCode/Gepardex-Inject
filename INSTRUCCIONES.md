# Instrucciones para Ejecutar el Proyecto
 
## 1. Prerrequisitos

Necesitarás instalar **Bun**, que es el motor de ejecución rápido que utiliza este proyecto para el backend y el frontend.

- **Instalar Bun:** Abre una terminal (PowerShell o CMD) y ejecuta:
  ```powershell
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```
  *(O visita [bun.sh](https://bun.sh/) para más opciones de instalación en Mac/Linux).*

---

## 2. Configuración del Entorno (Archivo .env)

La base de datos de este proyecto ya está **hospedada en la nube**, por lo que **no es necesario** instalar ni configurar servidores locales como XAMPP o MySQL. Solamente necesitas proveer la URL de conexión.

En la raíz del proyecto encontrarás (o deberás crear) un archivo llamado `.env`. En este archivo debes agregar tus llaves de conexión a la base de datos remota (Neon o la que estés utilizando) y la clave de la IA.

### Variables principales:
- `DATABASE_URL`: Cadena de conexión tipo PostgreSQL (tu base de datos en la nube).
- `CEREBRAS_API_KEY`: Llave para la conexión con la API del modelo de inteligencia artificial.

```env
DATABASE_URL=postgresql://neondb_owner:ejemplo@...us-east-1.aws.neon.tech/neondb?sslmode=require
CEREBRAS_API_KEY=tu_api_key_aqui
```
> *Asegúrate de reemplazar los valores con tus credenciales reales.*

---

## 3. Instalación y Ejecución

Una vez que tengas Bun instalado y tu archivo `.env` correctamente configurado:

1. **Abrir la terminal:** Abre una terminal en la carpeta raíz del proyecto.
2. **Instalar dependencias:** Ejecuta el siguiente comando para descargar los paquetes necesarios:
   ```bash
   bun install
   ```
3. **Ejecutar el proyecto:** Para iniciar sincronizadamente el servidor del backend y el de la interfaz, ejecuta:
   ```bash
   bun run dev:full
   ```
   *Nota: Si estás en VS Code y el comando anterior falla en la terminal por defecto (Bash o similar), cambia tu terminal a **PowerShell** y usa este comando alternativo:*
   ```powershell
   Start-Process bun "dev:back" ; Start-Process bun "dev:front"
   ```

El proyecto estará disponible para su uso local en:
- **URL Principal:** [http://localhost:5173](http://localhost:5173) (o el puerto que te asigne Vite al iniciar el frontend).


---

## 4. Credenciales de Administrador

Ya con el proyecto en ejecución y conectado a los datos en la nube, puedes iniciar sesión con plenos permisos directamente usando la siguiente cuenta preconfigurada en la base de datos:

- **Email:** `admin@admin.com`
- **Contraseña:** `password`
