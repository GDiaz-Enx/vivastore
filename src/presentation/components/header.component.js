/**
 * Header Component
 * Maneja el comportamiento del header (scroll, sticky, etc.)
 */

export class HeaderComponent {
    constructor() {
        this.header = document.getElementById('main-header');
        this.lastScrollY = window.scrollY;
        this.init();
    }

    init() {
        this.setupScrollBehavior();
    }

    setupScrollBehavior() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    handleScroll() {
        const currentScrollY = window.scrollY;

        // Agregar sombra cuando se hace scroll
        if (currentScrollY > 10) {
            this.header.classList.add('header--scrolled');
        } else {
            this.header.classList.remove('header--scrolled');
        }

        this.lastScrollY = currentScrollY;
    }
}
