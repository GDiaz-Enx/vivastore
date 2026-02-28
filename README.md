# Viva Store - Catálogo de Productos

Catálogo de productos minimalista con integración a Google Sheets. Sin checkout ni pagos, solo visualización y contacto directo por WhatsApp.

## 🚀 Características

- ✨ Diseño minimalista y amigable
- 📱 Totalmente responsive
- 🎨 Header con gradient animado en tonos lilas y salmon
- 📊 Integración con Google Sheets para gestión de productos
- 💬 Contacto directo por WhatsApp
- 📸 **Modo Share**: Captura y comparte productos en redes sociales
- 🏗️ Arquitectura Clean
- 🚫 Sin dependencias externas (Vanilla JS)

## 📸 Modo Share

### ¿Cómo funciona?

Accede a tu sitio con la ruta `/share` desde un dispositivo móvil para activar el modo compartir:

```
https://tuweb.com/share
```

**En modo share:**
1. Navega por el catálogo normalmente
2. Toca el botón "Consultar" en cualquier producto
3. El sistema capturará automáticamente una imagen del producto
4. Se abrirá el menú nativo de compartir de tu teléfono
5. ¡Comparte directamente en WhatsApp, Instagram, Facebook o como estado de WhatsApp!

**Características técnicas:**
- ✅ Solo funciona en dispositivos móviles
- ✅ Captura con márgenes (30px horizontal, 50px vertical)
- ✅ Alta calidad (2x scale)
- ✅ Usa la Web Share API nativa
- ✅ Fallback a descarga si no se puede compartir

### Ejemplo de uso:
```
www.vivastorear.com/share  ← Modo normal + función compartir
www.vivastorear.com        ← Modo normal (WhatsApp directo)
```

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

## 🎨 Personalización

### Colores
Modifica las variables en `src/presentation/styles/variables.css`:
```css
--color-primary: #C084FC;
--color-secondary: #FB923C;
--color-accent: #F472B6;
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

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

---

**Viva Store** - Hecho con ❤️ y ☕
