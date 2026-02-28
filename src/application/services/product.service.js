import { GetProductsUseCase } from '../../domain/use-cases/get-products.use-case.js';
import { GoogleSheetsAdapter } from '../../infrastructure/adapters/google-sheets.adapter.js';

/**
 * Product Service
 * Servicio de aplicación que orquesta los casos de uso
 */
export class ProductService {
    constructor() {
        this.repository = new GoogleSheetsAdapter();
        this.getProductsUseCase = new GetProductsUseCase(this.repository);
    }

    /**
     * Obtiene todos los productos
     */
    async getAllProducts() {
        return await this.getProductsUseCase.execute();
    }

    /**
     * Filtra productos por categoría
     */
    async getProductsByCategory(category) {
        const result = await this.getAllProducts();
        
        if (!result.success) {
            return result;
        }

        const filtered = result.data.filter(
            product => product.category.toLowerCase() === category.toLowerCase()
        );

        return {
            ...result,
            data: filtered
        };
    }

    /**
     * Busca productos por término
     */
    async searchProducts(searchTerm) {
        const result = await this.getAllProducts();
        
        if (!result.success) {
            return result;
        }

        const term = searchTerm.toLowerCase();
        const filtered = result.data.filter(product =>
            product.title.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        );

        return {
            ...result,
            data: filtered
        };
    }
}
