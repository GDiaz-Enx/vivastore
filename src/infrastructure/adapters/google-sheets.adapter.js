import { Product } from '../../domain/entities/product.entity.js';
import { 
    GOOGLE_SHEET_ID, 
    GOOGLE_API_KEY, 
    SHEET_RANGE, 
    SHEETS_API_URL,
    SHEET_COLUMNS,
    REQUEST_TIMEOUT,
    USE_MOCK_ON_ERROR
} from '../config/google-sheets.config.js';
import { MOCK_PRODUCTS } from '../mock/products.mock.js';

/**
 * Google Sheets Adapter
 * Adaptador para comunicarse con Google Sheets API
 */
export class GoogleSheetsAdapter {
    constructor() {
        this.baseUrl = SHEETS_API_URL;
        this.sheetId = GOOGLE_SHEET_ID;
        this.apiKey = GOOGLE_API_KEY;
    }

    /**
     * Obtiene todos los productos del Google Sheet
     */
    async getAll() {
        try {
            // Si no hay configuración de API, usar mock directamente
            if (!this.apiKey || this.apiKey.includes('XXXX')) {
                return this.getMockProducts();
            }

            const url = `${this.baseUrl}/${this.sheetId}/values/${SHEET_RANGE}?key=${this.apiKey}`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const response = await fetch(url, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.mapToProducts(data.values);

        } catch (error) {
            if (USE_MOCK_ON_ERROR) {
                return this.getMockProducts();
            }
            
            throw error;
        }
    }

    /**
     * Mapea los datos del sheet a entidades Product
     */
    mapToProducts(rows) {
        if (!rows || rows.length <= 1) {
            return [];
        }

        // Omitir la primera fila (headers)
        return rows.slice(1)
            .filter(row => row[SHEET_COLUMNS.TITLE]) // Filtrar filas vacías
            .map((row, index) => {
                try {
                    return new Product({
                        id: row[SHEET_COLUMNS.ID] || `product-${index + 1}`,
                        title: row[SHEET_COLUMNS.TITLE],
                        description: row[SHEET_COLUMNS.DESCRIPTION] || '',
                        price: parseFloat(row[SHEET_COLUMNS.PRICE]) || 0,
                        imageUrl: row[SHEET_COLUMNS.IMAGE_URL] || this.getPlaceholderImage(),
                        category: row[SHEET_COLUMNS.CATEGORY] || 'General'
                    });
                } catch (error) {
                    return null;
                }
            })
            .filter(product => product && product.isValid());
    }

    /**
     * Retorna productos mock
     */
    getMockProducts() {
        return MOCK_PRODUCTS.map(mockData => new Product(mockData));
    }

    /**
     * Retorna URL de imagen placeholder
     */
    getPlaceholderImage() {
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';
    }
}
