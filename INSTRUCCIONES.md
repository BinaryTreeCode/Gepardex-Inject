# Instrucciones para Ejecutar el Proyecto

Este documento detalla los pasos necesarios para configurar y ejecutar el proyecto en un entorno local, asumiendo que ya tienes **XAMPP** instalado.

> **Nota importante sobre versiones:** Asegúrate de estar situado en la rama `version-estable-local` (creada a partir del último tag estable). Esto garantiza que el código local funcionará perfectamente con la base de datos sin interferencias con pruebas experimentales del servidor. Puedes confirmarlo o cambiarte a ella en tu consola usando el comando: `git checkout version-estable-local`.

## 1. Prerrequisitos

Además de XAMPP, necesitarás instalar **Bun**, que es el motor de ejecución que utiliza este proyecto para el backend y el frontend.

- **Instalar Bun:** Abre una terminal (PowerShell o CMD) y ejecuta:
  ```powershell
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```
  *(O visita [bun.sh](https://bun.sh/) para más opciones de instalación).*

---

## 2. Configuración de la Base de Datos (XAMPP)

1. **Iniciar MySQL:**
   - Abre el **Control Panel de XAMPP**.
   - Haz clic en el botón **Start** junto a "MySQL".
2. **Importar los Datos:**
   - Haz clic en el botón **Admin** de MySQL (esto abrirá **phpMyAdmin** en tu navegador).
   - En la columna de la izquierda, haz clic en **Nueva** o **New**.
   - Crea una base de datos llamada `mini` (este es el nombre configurado por defecto en el script SQL).
   - Una vez creada, haz clic en la pestaña **Importar** o **Import** en la parte superior.
   - Selecciona el archivo `demo.sql` que se encuentra en la raíz del proyecto.
   - Haz clic en **Importar** (al final de la página).

---

## 3. Configuración del Entorno (Archivo .env)

En la raíz del proyecto encontrarás un archivo llamado `.env`. **Es fundamental que los valores aquí configurados coincidan exactamente con tu instalación local de XAMPP**, ya que de lo contrario el servidor no podrá conectarse a la base de datos.

### Variables principales:
- `DB_HOST`: Por defecto es `localhost`.
- `DB_PORT`: Por defecto es `3306`. Si en tu XAMPP aparece un puerto distinto, cámbialo aquí.
- `DB_USER`: Por defecto en XAMPP es `root`.
- `DB_PASSWORD`: Por defecto en XAMPP viene vacío. Si tú le pusiste una contraseña a tu MySQL local, deberás escribirla aquí.
- `DB_NAME`: Por defecto configurado como `mini`. **AVISO IMPORTANTE:** Este nombre debe ser idéntico al que usaste al crear la base de datos en phpMyAdmin (Paso 2). Si al importar el SQL le pusiste otro nombre, asegúrate de actualizarlo aquí para que coincidan.
- `CEREBRAS_API_KEY`: Esta es la llave para la conexión con el modelo de IA.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mini
CEREBRAS_API_KEY=tu_api_key_aqui
```

---

## 4. Instalación y Ejecución

Una vez que tengas Bun instalado y la base de datos configurada:

1. **Abrir la terminal:** Abre una terminal en la carpeta raíz del proyecto.
2. **Instalar dependencias:** Ejecuta el siguiente comando para descargar los paquetes necesarios:
   ```bash
   bun install
   ```
3. **Ejecutar el proyecto:** Para iniciar el servidor, tanto backend como frontend, ejecuta:
   ```bash
   bun run dev:full
   ```

El proyecto estará disponible en:
- **URL Principal:** [http://localhost:5173](http://localhost:5173) (o el puerto que te asigne la consola al iniciar el frontend).

---

## 5. Credenciales de Administrador

Una vez que tengas el proyecto corriendo con la base de datos importada, puedes iniciar sesión con plenos permisos utilizando la siguiente cuenta preconfigurada:

- **Email:** `admin@admin.com`
- **Contraseña:** `password`
