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
     * Captura screenshot de una card con márgenes adicionales
     * @param {HTMLElement} cardElement - Elemento de la card a capturar
     * @returns {Promise<Blob>} - Imagen capturada como Blob
     */
    static async captureCard(cardElement) {
        let button = null;
        let originalButtonDisplay = '';
        
        try {
            console.log('� Iniciando proceso de captura...');
            console.log('📍 Card element:', cardElement);
            
            // Ocultar el botón antes de capturar
            button = cardElement.querySelector('.product-card__button');
            originalButtonDisplay = button ? button.style.display : '';
            if (button) {
                button.style.display = 'none';
                console.log('🙈 Botón ocultado');
            }
            
            // Crear wrapper temporal FUERA del viewport con un CLON
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                position: fixed;
                top: -9999px;
                left: -9999px;
                padding: 50px 30px;
                background-color: #F9FAFB;
                display: inline-block;
            `;
            
            // CLONAR la card (no moverla!)
            const cardClone = cardElement.cloneNode(true);
            
            // Remover botón del clon
            const clonedButton = cardClone.querySelector('.product-card__button');
            if (clonedButton) {
                clonedButton.remove();
            }
            
            wrapper.appendChild(cardClone);
            document.body.appendChild(wrapper);
            
            // Esperar renderizado
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Importar dom-to-image-more
            console.log('📦 Cargando dom-to-image...');
            const domtoimage = await import('https://cdn.jsdelivr.net/npm/dom-to-image-more@3.0.3/+esm');
            console.log('✅ dom-to-image cargado');
            
            // Capturar
            console.log('INICIANDO CAPTURA toBlob...');
            const blob = await domtoimage.default.toBlob(wrapper, {
                quality: 0.95,
                bgcolor: '#F9FAFB',
                cacheBust: false
            });
            console.log('BLOB GENERADO:', blob, 'SIZE:', blob ? blob.size : 'null');
            
            // Limpiar wrapper temporal
            document.body.removeChild(wrapper);
            
            console.log('✅ Captura exitosa, tamaño:', blob.size, 'bytes');
            
            // Restaurar botón en la card ORIGINAL
            if (button) {
                button.style.display = originalButtonDisplay;
            }
            
            return blob;
            
        } catch (error) {
            console.error('!!!!! ERROR EN CAPTURA:', error);
            console.error('!!!!! Error type:', typeof error);
            console.error('!!!!! Error message:', error.message);
            console.error('!!!!! Error stack:', error.stack);
            console.error('!!!!! Error toString:', error.toString());
            
            // Limpiar wrapper si existe
            if (wrapper && wrapper.parentNode) {
                try {
                    document.body.removeChild(wrapper);
                    console.log('Wrapper limpiado despues de error');
                } catch (cleanupError) {
                    console.error('Error limpiando wrapper:', cleanupError);
                }
            }
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
            
            console.log('📸 Iniciando captura en 100ms...');
            
            // Pequeña pausa para que el botón se vea normal antes de capturar
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capturar screenshot
            console.log('📸 Capturando card...');
            const imageBlob = await this.captureCard(cardElement);
            console.log('✅ Card capturada, tamaño:', imageBlob.size);

            // Mostrar indicador de que se está compartiendo
            button.innerHTML = '<span>Compartiendo...</span>';

            // Compartir imagen
            console.log('📤 Compartiendo imagen...');
            await this.shareImage(imageBlob, productTitle);
            console.log('✅ Imagen compartida');

            // Restaurar botón
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.opacity = '1';
            
            return true; // Éxito
        } catch (error) {
            console.error('❌ Error en handleShareClick:', error);
            
            // Restaurar botón
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.opacity = '1';
            
            // Mostrar error amigable
            alert('Error al capturar o compartir la imagen. Por favor, intenta de nuevo.');
            
            return false;
        }
    }
}
