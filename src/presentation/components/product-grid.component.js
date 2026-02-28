import { ProductCardComponent } from './product-card.component.js';

/**
 * Product Grid Component
 * Componente para renderizar la grilla de productos
 */

export class ProductGridComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.products = [];
        this.allProducts = []; // Guardar todos los productos para búsqueda
        this.currentCategory = 'all'; // Categoría actual seleccionada
        this.currentSearchTerm = ''; // Término de búsqueda actual
    }

    /**
     * Renderiza la lista de productos
     */
    render(products) {
        this.products = products;
        this.container.innerHTML = '';

        if (products.length === 0) {
            this.renderEmptyState();
            return;
        }

        products.forEach((product, index) => {
            const card = new ProductCardComponent(product);
            const cardElement = card.render();
            
            // Delay progresivo para animación escalonada
            cardElement.style.transitionDelay = `${index * 0.05}s`;
            
            this.container.appendChild(cardElement);
        });
    }

    /**
     * Guarda todos los productos para búsqueda
     */
    setAllProducts(products) {
        this.allProducts = products;
    }

    /**
     * Obtiene todas las categorías únicas de los productos
     */
    getCategories() {
        const categories = new Set();
        this.allProducts.forEach(product => {
            if (product.category) {
                categories.add(product.category);
            }
        });
        return Array.from(categories).sort();
    }

    /**
     * Filtra productos por categoría
     */
    filterByCategory(category) {
        this.currentCategory = category;
        this.applyFilters();
    }

    /**
     * Filtra y renderiza productos según término de búsqueda
     */
    filterProducts(searchTerm) {
        this.currentSearchTerm = searchTerm;
        this.applyFilters();
        return this.products.length;
    }

    /**
     * Aplica todos los filtros activos (categoría + búsqueda)
     */
    applyFilters() {
        let filtered = this.allProducts;

        // Filtrar por categoría
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(product => 
                product.category === this.currentCategory
            );
        }

        // Filtrar por búsqueda
        if (this.currentSearchTerm && this.currentSearchTerm.trim() !== '') {
            const term = this.currentSearchTerm.toLowerCase().trim();
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(term) ||
                (product.description && product.description.toLowerCase().includes(term))
            );
        }

        this.render(filtered);
    }

    /**
     * Renderiza estado vacío
     */
    renderEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h3 class="empty-state__title">No se encontraron productos</h3>
                <p class="empty-state__description">Intenta con otro criterio de búsqueda</p>
            </div>
        `;
    }

    /**
     * Muestra estado de carga
     */
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        this.container.classList.add('hidden');
    }

    /**
     * Oculta estado de carga
     */
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        this.container.classList.remove('hidden');
    }

    /**
     * Muestra mensaje de error
     */
    showError(message) {
        const errorElement = document.getElementById('error');
        errorElement.querySelector('.error__message').textContent = message;
        errorElement.classList.remove('hidden');
        
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }
}
