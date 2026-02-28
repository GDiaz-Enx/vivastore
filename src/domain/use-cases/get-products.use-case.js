/**
 * Get Products Use Case
 * Caso de uso para obtener la lista de productos
 */
export class GetProductsUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute() {
        try {
            const products = await this.productRepository.getAll();
            return {
                success: true,
                data: products,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                data: [],
                error: error.message
            };
        }
    }
}
