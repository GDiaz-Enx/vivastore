/**
 * Share Helper
 * Utilidades para capturar y compartir productos
 */

export class ShareHelper {
    /**
     * Detecta si el usuario está en un dispositivo móvil
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Detecta si estamos en modo share (ruta /share)
     */
    static isShareMode() {
        return window.location.pathname.includes('/share');
    }

    /**
     * Captura screenshot de una card con márgenes adicionales
     * @param {HTMLElement} cardElement - Elemento de la card a capturar
     * @returns {Promise<Blob>} - Imagen capturada como Blob
     */
    static async captureCard(cardElement) {
        try {
            // Importar html2canvas dinámicamente
            const html2canvas = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');
            
            // Obtener dimensiones de la card
            const rect = cardElement.getBoundingClientRect();
            
            // Configuración para capturar con márgenes
            const options = {
                backgroundColor: '#F9FAFB', // Fondo claro igual al de la página
                scale: 2, // Alta calidad
                x: rect.left - 30, // Margen izquierdo
                y: rect.top + window.scrollY - 50, // Margen superior
                width: rect.width + 60, // Ancho + márgenes horizontales (30px cada lado)
                height: rect.height + 100, // Alto + márgenes verticales (50px cada lado)
                logging: false,
                useCORS: true, // Para cargar imágenes externas
                allowTaint: true
            };

            // Capturar el canvas
            const canvas = await html2canvas.default(cardElement, options);
            
            // Convertir canvas a Blob
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Error al crear el blob de la imagen'));
                    }
                }, 'image/png');
            });
        } catch (error) {
            console.error('Error al capturar screenshot:', error);
            throw error;
        }
    }

    /**
     * Comparte la imagen usando la Web Share API
     * @param {Blob} imageBlob - Imagen a compartir
     * @param {string} productTitle - Título del producto para el texto compartido
     */
    static async shareImage(imageBlob, productTitle) {
        try {
            // Verificar si la Web Share API está disponible
            if (!navigator.share) {
                throw new Error('Web Share API no disponible');
            }

            // Crear archivo desde el blob
            const file = new File([imageBlob], `${productTitle}.png`, { type: 'image/png' });

            // Verificar si se pueden compartir archivos
            if (navigator.canShare && !navigator.canShare({ files: [file] })) {
                throw new Error('No se pueden compartir archivos en este dispositivo');
            }

            // Compartir
            await navigator.share({
                files: [file],
                title: 'Viva Store',
                text: 'Mirá mas de mis productos en www.vivastorear.com'
            });

            console.log('Imagen compartida exitosamente');
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Usuario canceló el compartir');
            } else {
                console.error('Error al compartir:', error);
                // Fallback: descargar la imagen
                this.downloadImage(imageBlob, productTitle);
            }
        }
    }

    /**
     * Fallback: descarga la imagen si no se puede compartir
     * @param {Blob} imageBlob - Imagen a descargar
     * @param {string} productTitle - Título del producto
     */
    static downloadImage(imageBlob, productTitle) {
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${productTitle}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Maneja el click en el botón de consultar en modo share
     * @param {Event} event - Evento del click
     * @param {HTMLElement} cardElement - Elemento de la card
     * @param {string} productTitle - Título del producto
     */
    static async handleShareClick(event, cardElement, productTitle) {
        event.preventDefault();
        event.stopPropagation();

        // Solo en móviles y modo share
        if (!this.isMobile() || !this.isShareMode()) {
            return false; // Continuar con comportamiento normal
        }

        try {
            // Mostrar indicador de carga
            const button = event.currentTarget;
            const originalText = button.innerHTML;
            button.innerHTML = '<span>Capturando...</span>';
            button.disabled = true;

            // Capturar screenshot
            const imageBlob = await this.captureCard(cardElement);

            // Compartir imagen
            await this.shareImage(imageBlob, productTitle);

            // Restaurar botón
            button.innerHTML = originalText;
            button.disabled = false;
        } catch (error) {
            console.error('Error en handleShareClick:', error);
            alert('Error al capturar o compartir la imagen. Por favor, intenta de nuevo.');
            
            // Restaurar botón
            const button = event.currentTarget;
            button.innerHTML = originalText;
            button.disabled = false;
        }

        return true; // Prevenir comportamiento normal
    }
}
