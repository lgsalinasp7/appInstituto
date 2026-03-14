# Ejemplos de invocación

El skill se invoca explícitamente. Formas típicas de llamarlo:

## Invocación directa

```
Usa el skill visily-to-nextjs para implementar la vista de esta carpeta:
C:\Users\...\Downloads\pantallas KaledSoft-kaledacademy\DevHub - Bootcamp Dashboard
```

```
Implementa la vista de Visily usando el skill visily-to-nextjs.
Ruta del export: C:\Users\lgsal\Downloads\pantallas KaledSoft-kaledacademy\DevHub - Bootcamp Dashboard
```

## Una sola vista

```
@visily-to-nextjs
Convierte el diseño de esta carpeta a una página Next.js:
./Downloads/pantallas/DevHub - Bootcamp Dashboard
```

## Múltiples vistas (batch)

```
@visily-to-nextjs
Implementa todas las vistas de esta carpeta en el proyecto:
C:\Users\lgsal\Downloads\pantallas KaledSoft-kaledacademy

Cada subcarpeta es una vista (DevHub - Bootcamp Dashboard, Student Dashboard, etc.)
```

## Con parámetros adicionales

```
@visily-to-nextjs
Ruta export: C:\...\DevHub - Bootcamp Dashboard
Ruta destino: /dashboard/bootcamp
El proyecto ya tiene layout con sidebar, descarta el del export.
```

## En proyectos con config

Si el proyecto tiene `visily-skill.config.json`, basta con:

```
@visily-to-nextjs
Implementa la vista de: C:\...\DevHub - Bootcamp Dashboard
```

El skill leerá la config y aplicará las opciones definidas.
