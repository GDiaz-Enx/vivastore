# Copilot Instructions - Viva Store

## Project Overview
Viva Store - Catálogo de productos minimalista que muestra productos desde Google Sheets. Sin checkout ni pagos, solo visualización y contacto por WhatsApp.

## Architecture
- **Frontend**: HTML5, CSS3, JavaScript ES6+ (Vanilla)
- **Backend**: N/A (Static site)
- **Database**: Google Sheets API
- **Arquitectura**: Clean Architecture
  - `presentation/`: UI components y estilos
  - `domain/`: Entidades y casos de uso
  - `infrastructure/`: Adaptadores externos (Google Sheets)
  - `application/`: Orquestación de casos de uso

## Development Workflow

### Setup
```bash
# No requiere instalación de dependencias
# Solo abrir index.html en navegador o usar Live Server
```

### Running the Application
```bash
# Opción 1: Abrir directamente
open index.html

# Opción 2: Con Live Server (VSCode extension)
# Click derecho en index.html > Open with Live Server

# Opción 3: Con servidor Python
python -m http.server 8000
```

### Testing
```bash
# Tests manuales visuales
# Verificar responsive design en DevTools
```

## Code Conventions

### Naming Patterns
- **Files**: kebab-case (product-card.js, product-service.js)
- **Classes**: PascalCase (ProductCard, GoogleSheetsAdapter)
- **Functions/Variables**: camelCase (getProducts, productList)
- **Constants**: UPPER_SNAKE_CASE (API_KEY, SHEET_ID)

### Project-Specific Patterns
- **Components**: Web Components nativos para reutilización
- **Data fetching**: Fetch API con async/await
- **State management**: Observer pattern simple
- **Error handling**: Try-catch con fallback a datos mock

## Key Integrations
- Google Sheets API v4 (read-only, public sheets)
- WhatsApp Web API para botón de contacto

## Common Tasks

### Actualizar Sheet ID
Modificar `GOOGLE_SHEET_ID` en `src/infrastructure/config/google-sheets.config.js`

### Agregar nuevas columnas al Sheet
1. Actualizar interfaz `Product` en `src/domain/entities/product.entity.js`
2. Modificar mapper en `src/infrastructure/adapters/google-sheets.adapter.js`
3. Actualizar template en `src/presentation/components/product-card.component.js`

### Cambiar colores del tema
Modificar variables CSS en `src/presentation/styles/variables.css`

---
*Proyecto estático con arquitectura limpia y escalable*
