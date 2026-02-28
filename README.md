# Viva Store - Catálogo de Productos

Catálogo de productos minimalista con integración a Google Sheets. Sin checkout ni pagos, solo visualización y contacto directo por WhatsApp.

## 🚀 Características

- ✨ Diseño minimalista y amigable
- 📱 Totalmente responsive
- 🎨 Header con gradient animado en tonos lilas y salmon
- 📊 Integración con Google Sheets para gestión de productos
- 💬 Contacto directo por WhatsApp
- 🏗️ Arquitectura Clean
- 🚫 Sin dependencias externas (Vanilla JS)

## 📁 Estructura del Proyecto

```
Viva Store/
├── index.html
├── src/
│   ├── domain/              # Lógica de negocio
│   │   ├── entities/        # Entidades del dominio
│   │   └── use-cases/       # Casos de uso
│   ├── infrastructure/      # Adaptadores externos
│   │   ├── adapters/        # Adaptador Google Sheets
│   │   ├── config/          # Configuración
│   │   └── mock/            # Datos de prueba
│   ├── application/         # Servicios de aplicación
│   │   └── services/
│   └── presentation/        # UI y estilos
│       ├── components/      # Componentes JS
│       └── styles/          # CSS
└── assets/
    ├── images/
    └── icons/
```

## 🛠️ Configuración

### 1. Google Sheets

1. Crea un Google Sheet con las siguientes columnas:
   - **Título** (A): Nombre del producto
   - **Descripción** (B): Descripción opcional
   - **Precio** (C): Precio numérico
   - **Imagen URL** (D): URL de la imagen
   - **Categoría** (E): Categoría del producto
   - **ID** (F): Identificador único (opcional)

2. Haz el sheet público:
   - Archivo → Compartir → Obtener enlace
   - Cambiar a "Cualquier persona con el enlace"

3. Obtén el Sheet ID de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```

4. Crea una API Key en [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

5. Actualiza la configuración en `src/infrastructure/config/google-sheets.config.js`:
   ```javascript
   export const GOOGLE_SHEET_ID = 'tu-sheet-id';
   export const GOOGLE_API_KEY = 'tu-api-key';
   ```

### 2. WhatsApp

Actualiza el número de WhatsApp en:
- `index.html` (línea 22)
- `src/presentation/components/product-card.component.js` (línea 38)

Reemplaza `5491154913309` con tu número (formato internacional sin + ni espacios).

## 🚀 Ejecución

### Opción 1: Directamente en el navegador
```bash
# Abre index.html con doble click
```

### Opción 2: Live Server (VS Code)
```bash
# Click derecho en index.html → Open with Live Server
```

### Opción 3: Servidor HTTP Python
```bash
python -m http.server 8000
# Abre http://localhost:8000
```

### Opción 4: Servidor HTTP Node
```bash
npx http-server -p 8000
# Abre http://localhost:8000
```

## 🎨 Personalización

### Colores
Modifica las variables en `src/presentation/styles/variables.css`:
```css
--color-primary: #C084FC;
--color-secondary: #FB923C;
--color-accent: #F472B6;
```

### Layout
Ajusta el grid en `src/presentation/styles/main.css`:
```css
.product-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
```

## 🧪 Datos de Prueba

El proyecto incluye datos mock que se cargan automáticamente si:
- No se configura la API Key de Google
- Hay un error al conectar con Google Sheets
- `USE_MOCK_ON_ERROR` está en `true` (por defecto)

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

## 🏗️ Arquitectura Clean

El proyecto sigue los principios de Clean Architecture:

- **Domain**: Entidades y lógica de negocio pura
- **Application**: Orquestación de casos de uso
- **Infrastructure**: Detalles de implementación (APIs, etc.)
- **Presentation**: UI y componentes visuales

## 🔧 Tecnologías

- HTML5
- CSS3 (Variables, Grid, Flexbox, Animations)
- JavaScript ES6+ (Modules, Classes, Async/Await)
- Google Sheets API v4
- WhatsApp Web API

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

---

**Viva Store** - Hecho con ❤️ y ☕
