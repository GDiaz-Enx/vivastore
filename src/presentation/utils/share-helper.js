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
     * Detecta si estamos en modo share (ruta /share o ?mode=share)
     */
    static isShareMode() {
        // Opción 1: Query parameter ?mode=share
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'share') {
            return true;
        }
        
        // Opción 2: Ruta /share o /share/
        if (window.location.pathname.includes('/share')) {
            return true;
        }
        
        return false;
    }

    /**
     * Convierte imagen a Data URL para evitar problemas de CORS
     * @param {HTMLImageElement} img - Imagen a convertir
     * @returns {Promise<string>} - Data URL de la imagen
     */
    static async imageToDataURL(img) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                resolve(canvas.toDataURL('image/png'));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Descarga imagen desde URL y la convierte a Data URL usando fetch
     * @param {string} url - URL de la imagen
     * @returns {Promise<string>} - Data URL de la imagen
     */
    static async fetchImageAsDataURL(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            throw new Error(`Failed to fetch image: ${error.message}`);
        }
    }

    /**
     * Captura screenshot de una card con márgenes adicionales
     * @param {HTMLElement} cardElement - Elemento de la card a capturar
     * @returns {Promise<Blob>} - Imagen capturada como Blob
     */
    static async captureCard(cardElement) {
        let button = null;
        let originalButtonDisplay = '';
        let wrapper = null;
        
        try {
            // Ocultar el botón antes de capturar
            button = cardElement.querySelector('.product-card__button');
            originalButtonDisplay = button ? button.style.display : '';
            if (button) {
                button.style.display = 'none';
            }
            
            // Crear wrapper temporal FUERA del viewport con un CLON
            wrapper = document.createElement('div');
            wrapper.style.cssText = `
                position: fixed;
                top: -9999px;
                left: -9999px;
                padding: 30px 15px;
                background: linear-gradient(
                    135deg,
                    #E9D5FF 0%,
                    #DDD6FE 15%,
                    #C084FC 30%,
                    #F0ABFC 50%,
                    #FB923C 70%,
                    #FECACA 85%,
                    #FED7AA 100%
                );
                display: inline-block;
            `;
            
            // CLONAR la card (no moverla!)
            const cardClone = cardElement.cloneNode(true);
            
            // Convertir imágenes externas a Data URLs usando proxy CORS
            const images = cardClone.querySelectorAll('img');
            
            for (const img of images) {
                try {
                    if (img.src && !img.src.startsWith('data:')) {
                        // Usar proxy CORS para cargar la imagen
                        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(img.src)}`;
                        const dataUrl = await this.fetchImageAsDataURL(proxyUrl);
                        img.src = dataUrl;
                    }
                } catch (err) {
                    // Si falla, intentar sin proxy
                    try {
                        const dataUrl = await this.fetchImageAsDataURL(img.src);
                        img.src = dataUrl;
                    } catch (err2) {
                        // Silenciar error
                    }
                }
            }
            
            // Remover botón del clon
            const clonedButton = cardClone.querySelector('.product-card__button');
            if (clonedButton) {
                clonedButton.remove();
            }
            
            // Remover categoría del clon
            const clonedCategory = cardClone.querySelector('.product-card__category');
            if (clonedCategory) {
                clonedCategory.remove();
            }
            
            // Aumentar tamaño de fuentes para mejor legibilidad en estados de WhatsApp
            const clonedTitle = cardClone.querySelector('.product-card__title');
            if (clonedTitle) {
                clonedTitle.style.fontSize = '24px';
                clonedTitle.style.fontWeight = '700';
                clonedTitle.style.lineHeight = '1.3';
            }
            
            const clonedDescription = cardClone.querySelector('.product-card__description');
            if (clonedDescription) {
                clonedDescription.style.fontSize = '18px';
                clonedDescription.style.lineHeight = '1.5';
            }
            
            const clonedPrice = cardClone.querySelector('.product-card__price');
            if (clonedPrice) {
                clonedPrice.style.fontSize = '28px';
                clonedPrice.style.fontWeight = '800';
            }
            
            wrapper.appendChild(cardClone);
            document.body.appendChild(wrapper);
            
            // Esperar renderizado (más tiempo para las imágenes convertidas)
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Importar html2canvas (más estable que dom-to-image)
            const html2canvas = (await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.min.js')).default;
            
            // Capturar con html2canvas
            const canvas = await html2canvas(wrapper, {
                backgroundColor: '#E9D5FF',
                scale: 3,
                useCORS: false,
                allowTaint: true,
                logging: false
            });
            
            // Convertir canvas a blob
            const blob = await new Promise((resolve) => {
                canvas.toBlob((b) => resolve(b), 'image/png', 0.95);
            });
            
            // Limpiar wrapper temporal
            document.body.removeChild(wrapper);
            
            // Restaurar botón en la card ORIGINAL
            if (button) {
                button.style.display = originalButtonDisplay;
            }
            
            return blob;
            
        } catch (error) {
            // Limpiar wrapper si existe
            if (wrapper && wrapper.parentNode) {
                try {
                    document.body.removeChild(wrapper);
                } catch (cleanupError) {
                    // Silenciar error
                }
            }
            
            // Restaurar botón en la card ORIGINAL
            if (button) {
                button.style.display = originalButtonDisplay;
            }
            
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
                title: 'Ganga Style',
                text: 'Mirá mas de mis productos en www.vivastorear.com'
            });

        } catch (error) {
            if (error.name === 'AbortError') {
                // Usuario canceló
            } else {
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
        // Prevenir cualquier comportamiento por defecto
        if (event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }

        const button = event.currentTarget;
        const originalText = button.innerHTML;

        try {
            // Deshabilitar botón temporalmente sin cambiar el texto
            button.disabled = true;
            button.style.opacity = '0.6';
            
            // Pequeña pausa para que el botón se vea normal antes de capturar
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capturar screenshot
            const imageBlob = await this.captureCard(cardElement);

            // Mostrar indicador de que se está compartiendo
            button.innerHTML = '<span>Compartiendo...</span>';

            // Compartir imagen
            await this.shareImage(imageBlob, productTitle);

            // Restaurar botón
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.opacity = '1';
            
            return true; // Éxito
        } catch (error) {
            // Restaurar botón
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.opacity = '1';
            
            // Crear mensaje de error detallado
            const errorDetails = `
ERROR DE CAPTURA
-----------------
Tipo: ${error.name || 'Unknown'}
Mensaje: ${error.message || 'Sin mensaje'}
Stack: ${error.stack ? error.stack.substring(0, 200) : 'No disponible'}
Navegador: ${navigator.userAgent}
Tamaño viewport: ${window.innerWidth}x${window.innerHeight}
            `.trim();
            
            // Mostrar error con opción de copiar
            const userMessage = `Error al capturar o compartir la imagen.\n\n${errorDetails}\n\nPor favor, copia este mensaje y compártelo con el desarrollador.`;
            alert(userMessage);
            
            return false;
        }
    }
}
