# Examen Final Backend (Angular + Express)

Aplicación Angular que se sirve con un servidor Node/Express (server.js). Además, el servidor expone un endpoint `/api/Mensajes` que se conecta directamente a SQL Server.

## Requisitos
- Node.js 20+
- Acceso saliente a SQL Server (puerto 1433) hacia `svr-sql-ctezo.southcentralus.cloudapp.azure.com`.

## Cómo ejecutar en local (modo producción con servidor Express)
1) Instalar dependencias:
```
npm install
```
2) Construir y arrancar el servidor (sirve Angular desde `dist/` y expone `/api/Mensajes`):
```
npm run start
```
3) Abrir en el navegador:
```
http://localhost:8080
```

Al navegar a la sección “Mensajes”, el frontend consultará el endpoint local `/api/Mensajes` para listar los mensajes desde SQL Server.

## Alternativa de desarrollo (Angular en :4200 + API en :8080)
Si prefieres usar recarga rápida con Angular CLI:
1) En una consola, correr el servidor Express (API y estáticos):
```
npm run start
```
2) En otra consola, correr Angular en modo dev:
```
ng serve
```
3) Abre `http://localhost:4200`.

El componente de Mensajes detecta si corre en el puerto 4200 y llama automáticamente a `http://localhost:8080/api/Mensajes`, por lo que no necesitas configurar un proxy.

Nota: Si ves el mensaje “No se pudieron cargar los mensajes… Asegúrese de ejecutar: npm run start…”, significa que el servidor Express no está corriendo en `http://localhost:8080`.

## Despliegue en Render
Este repo incluye `render.yaml` con un servicio web tipo Node:
- buildCommand: `npm install && npm run build`
- startCommand: `npm start` (ejecuta `node server.js`)
- El servidor respeta la variable de entorno `PORT` que Render provee automáticamente.

Pasos:
1) Crear un nuevo servicio Web en Render desde este repositorio.
2) Verificar que el plan, el buildCommand y el startCommand coincidan con `render.yaml`.
3) Desplegar. Render construirá el Angular y arrancará `server.js`, sirviendo la app y el endpoint `/api/Mensajes` bajo el mismo dominio.

Consideraciones Render:
- Asegúrate de que el entorno de Render permita salida a SQL Server (salientes al puerto 1433). Render Free/Starter permite conexiones salientes.
- Si necesitas esconder credenciales, muévelas a variables de entorno y lee desde `process.env` en `server.js`.

## Scripts útiles
- `npm run build`: compila Angular en modo producción.
- `npm run start`: inicia Express sirviendo la compilación y la API.

## Notas técnicas
- El build de Angular genera artefactos en `dist/examen-final-backend/browser` y `server.js` sirve esa ruta.
- CORS básico está habilitado en `server.js` para facilitar el desarrollo cuando el frontend corre en `:4200` y la API en `:8080`.
