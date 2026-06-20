# Caja de Herramientas Pedagógicas — IED Brisas del Río

Una plataforma web interactiva y colaborativa diseñada para los docentes de la **IED Brisas del Río** (Barranquilla, Colombia). Permite explorar, buscar y compartir estrategias didácticas y metodologías de aula alineadas con el **Proyecto Educativo Institucional (PEI)**.

## Características Principales

*   **Catálogo Interactivo**: 15 estrategias pre-cargadas divididas en 5 áreas pedagógicas clave.
*   **Diseño Premium**: Interfaz moderna con Glassmorphic panels, gradientes HSL vibrantes, animaciones fluidas y soporte completo para **Modo Oscuro** (automático y manual).
*   **Búsqueda Avanzada**: Filtrado en tiempo real con resaltado visual (`<mark>`) de términos coincidentes.
*   **Favoritos Locales**: Guarda tus estrategias recurrentes con un click (`localStorage`) para acceso rápido.
*   **Compartir Estrategias**: Generación de enlaces únicos para cada herramienta (Deep Linking `#tool-{id}`) y atajo de compartir directo por **WhatsApp**.
*   **Navegación Inteligente (Scroll Spy)**: Barra de navegación fluida con indicador dinámico de sección activa y menú móvil responsive.
*   **Aportes de Docentes**: Formulario de envío con validación nativa UX y motor de entrega por correo (`mailto:` fallback) y almacenamiento local temporal.
*   **Panel Editorial**: Módulo de administración para revisar y autorizar propuestas locales y crear nuevas categorías. (Clave: `BDR2026`).
*   **PWA Instalable**: Soporte completo para instalación en smartphones o computadoras y navegación **Offline** mediante almacenamiento en caché de Service Worker.

## Estructura del Código

El proyecto está construido bajo una arquitectura modular y limpia utilizando **Vite + Vanilla JS**:

```
Caja de Herramientas pedagógicas/
├── index.html                # Entry point HTML
├── package.json              # Configuración y dependencias de desarrollo
├── vite.config.js            # Configuración de compilación para Vercel
├── public/
│   ├── data/
│   │   └── db.json           # Base de datos inicial (15 herramientas estáticas)
│   ├── manifest.json         # Manifiesto de PWA
│   ├── sw.js                 # Service Worker (Caché local offline)
│   └── icons/                # Iconos de la aplicación en varios tamaños
└── src/
    ├── main.js               # Punto de entrada de inicialización de la app
    ├── state.js              # Controlador del estado global reactivo
    ├── api.js                # Control de datos y descarga de copias de seguridad
    ├── router.js             # Lógica de Scroll Spy y navegación móvil
    ├── theme.js              # Control de modo claro y oscuro
    ├── search.js             # Motor de búsqueda y resaltador de texto
    ├── favorites.js          # Control de favoritas locales
    ├── share.js              # Módulo de enlaces dinámicos y WhatsApp
    ├── modal.js              # Ventana modal accesible con Focus Trap
    ├── render/               # Componentes visuales dinámicos
    │   ├── hero.js
    │   ├── stats.js
    │   ├── categories.js
    │   ├── cards.js
    │   ├── form.js
    │   ├── editor.js
    │   └── footer.js
    └── styles/               # Sistema de diseño modular CSS
        ├── index.css         # Archivo de importación maestra
        ├── variables.css     # Tokens de diseño (hsl, espaciados, bordes)
        ├── reset.css         # Reinicio de estilos y accesibilidad
        ├── layout.css        # Contenedores y layouts de rejilla
        ├── hero.css          # Estilo del banner principal
        ├── nav.css           # Barra de navegación interactiva
        ├── cards.css         # Tarjetas de herramientas y acordeones
        ├── modal.css         # Estilo de la ventana de detalles
        ├── form.css          # Formularios y retroalimentación UX
        ├── buttons.css       # Sistema de botones (primary, ghost, danger)
        ├── animations.css    # Animaciones scroll-driven y keyframes
        └── utilities.css     # Clases utilitarias (glassmorphism, toasts)
```

## Desarrollo Local

### Requisitos

*   [Node.js](https://nodejs.org/) (versión 18 o superior)
*   NPM (incluido con Node.js)

### Instrucciones

1.  Instala las dependencias de desarrollo:
    ```bash
    npm install
    ```

2.  Inicia el servidor de desarrollo local:
    ```bash
    npm run dev
    ```
    Abre tu navegador en `http://localhost:3000`.

3.  Compila el proyecto para producción:
    ```bash
    npm run build
    ```
    Los archivos optimizados y listos para subir a producción (Vercel) se generarán en la carpeta `dist/`.

4.  Prueba el compilado de producción localmente:
    ```bash
    npm run preview
    ```

## Acceso al Panel Editorial

Para activar las funciones administrativas del panel editorial:
1.  Navega a la sección **Panel Editorial** en la aplicación.
2.  Ingresa la clave de acceso: `BDR2026`.
3.  Haz click en **Activar Modo Editor**.

Esto desbloqueará el formulario para crear nuevas categorías pedagógicas y te permitirá revisar, publicar o archivar las propuestas enviadas por otros docentes. También puedes exportar el estado actual consolidado como un nuevo archivo `db.json` con el botón **Exportar Base de Datos**.
