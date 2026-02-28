import { ProductService } from '../application/services/product.service.js';
import { ProductGridComponent } from './components/product-grid.component.js';
import { HeaderComponent } from './components/header.component.js';
import { ShareHelper } from './utils/share-helper.js';

/**
 * Main Application
 * Punto de entrada de la aplicación
 */

class App {
    constructor() {
        this.productService = new ProductService();
        this.productGrid = new ProductGridComponent('product-grid');
        this.header = new HeaderComponent();
        this.searchInput = null;
        this.clearButton = null;
        this.resultsCount = null;
        this.categoryButtons = null;
    }

    async init() {
        try {
            console.log('🚀 Inicializando Viva Store...');
            
            // Mostrar banner si está en modo share y es móvil
            this.showShareBannerIfNeeded();
            
            this.productGrid.showLoading();
            
            const result = await this.productService.getAllProducts();
            
            this.productGrid.hideLoading();
            
            if (result.success) {
                console.log(`✅ ${result.data.length} productos cargados`);
                this.productGrid.setAllProducts(result.data);
                this.productGrid.render(result.data);
                
                // Inicializar filtros y búsqueda después de cargar productos
                this.initializeCategoryFilter();
                this.initializeSearch();
            } else {
                console.error('❌ Error cargando productos:', result.error);
                this.productGrid.showError(result.error);
            }
            
        } catch (error) {
            console.error('❌ Error fatal:', error);
            this.productGrid.hideLoading();
            this.productGrid.showError('Error al inicializar la aplicación');
        }
    }

    /**
     * Muestra un banner informativo si está en modo share en móvil
     */
    showShareBannerIfNeeded() {
        if (ShareHelper.isShareMode() && ShareHelper.isMobile()) {
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                const banner = document.createElement('div');
                banner.className = 'share-mode-banner';
                banner.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="currentColor"/>
                    </svg>
                    <div>
                        <strong>Modo Compartir Activado</strong>
                        <p>Toca "Consultar" en cualquier producto para capturar y compartir</p>
                    </div>
                `;
                heroSection.appendChild(banner);
            }
        }
    }

    /**
     * Inicializa el filtro de categorías
     */
    initializeCategoryFilter() {
        const categories = this.productGrid.getCategories();
        const categorySelect = document.getElementById('category-select');
        
        if (!categorySelect || categories.length === 0) return;

        // Crear opciones para cada categoría
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // Event listener para el select
        categorySelect.addEventListener('change', (e) => {
            this.handleCategoryFilter(e.target.value);
        });
    }

    /**
     * Maneja el filtro por categoría
     */
    handleCategoryFilter(category) {
        // Aplicar filtro
        this.productGrid.filterByCategory(category);
        
        // Actualizar contador de resultados
        this.updateResultsCount();
    }

    /**
     * Inicializa la funcionalidad de búsqueda
     */
    initializeSearch() {
        this.searchInput = document.getElementById('search-input');
        this.clearButton = document.getElementById('clear-search');
        this.resultsCount = document.getElementById('search-results-count');

        if (!this.searchInput) return;

        // Evento de búsqueda con debounce
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300); // Esperar 300ms después de que el usuario deje de escribir
        });

        // Botón de limpiar
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.searchInput.value = '';
                this.handleSearch('');
                this.searchInput.focus();
            });
        }

        // Enter para buscar inmediatamente
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                this.handleSearch(e.target.value);
            }
        });
    }

    /**
     * Maneja la búsqueda de productos
     */
    handleSearch(searchTerm) {
        const resultCount = this.productGrid.filterProducts(searchTerm);
        
        // Mostrar/ocultar botón de limpiar
        if (this.clearButton) {
            if (searchTerm.trim()) {
                this.clearButton.classList.remove('hidden');
            } else {
                this.clearButton.classList.add('hidden');
            }
        }

        // Actualizar contador
        this.updateResultsCount();

        // Scroll suave a resultados si hay búsqueda
        if (searchTerm.trim() && resultCount > 0) {
            setTimeout(() => {
                const grid = document.getElementById('product-grid');
                if (grid) {
                    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }

    /**
     * Actualiza el contador de resultados
     */
    updateResultsCount() {
        if (!this.resultsCount) return;

        const searchTerm = this.searchInput ? this.searchInput.value : '';
        const resultCount = this.productGrid.products.length;

        if (searchTerm.trim() || this.productGrid.currentCategory !== 'all') {
            this.resultsCount.textContent = `${resultCount} producto${resultCount !== 1 ? 's' : ''} encontrado${resultCount !== 1 ? 's' : ''}`;
            this.resultsCount.classList.remove('hidden');
            this.resultsCount.classList.add('highlight');
        } else {
            this.resultsCount.classList.add('hidden');
            this.resultsCount.classList.remove('highlight');
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new App();
        app.init();
    });
} else {
    const app = new App();
    app.init();
}

export default App;
