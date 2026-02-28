/**
 * Google Sheets Configuration
 * Configuración para conectar con Google Sheets API
 */

// IMPORTANTE: Reemplazar con tu Sheet ID real
// Para obtenerlo, abre tu Google Sheet y copia el ID de la URL:
// https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
export const GOOGLE_SHEET_ID = '1JaaFcTnGVUxeJXSu8KQXdvHqWiYI6_apirNis4FcbM0';

// API Key de Google (para sheets públicos, no requiere OAuth)
// Crear en: https://console.cloud.google.com/apis/credentials
export const GOOGLE_API_KEY = 'AIzaSyAUqyP2pqPcKV46_1sttJUnORfzwJjKL2A';

// Nombre de la hoja dentro del spreadsheet
export const SHEET_NAME = 'Productos';

// Rango de celdas a leer (A:F = columnas desde A hasta F)
export const SHEET_RANGE = `${SHEET_NAME}!A:F`;

// URL base de la API
export const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Configuración de columnas esperadas en el Sheet
 * Orden: Título | Descripción | Precio | Imagen URL | Categoría | ID
 */
export const SHEET_COLUMNS = {
    TITLE: 0,      // Columna A
    DESCRIPTION: 1, // Columna B
    PRICE: 2,      // Columna C
    IMAGE_URL: 3,  // Columna D
    CATEGORY: 4,   // Columna E
    ID: 5          // Columna F (opcional, se autogenera si no existe)
};

/**
 * Timeout para requests (ms)
 */
export const REQUEST_TIMEOUT = 10000;

/**
 * Indica si usar datos mock en caso de error
 */
export const USE_MOCK_ON_ERROR = false;
