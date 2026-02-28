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
            
            // Crear un contenedor wrapper con padding
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                padding: 50px 30px;
                background-color: #F9FAFB;
                display: inline-block;
                position: fixed;
                top: -9999px;
                left: -9999px;
            `;
            
            // Clonar la card
            const clone = cardElement.cloneNode(true);
            
            // Remover el botón del clon también
            const cloneButton = clone.querySelector('.product-card__button');
            if (cloneButton) {
                cloneButton.remove();
            }
            
            // Obtener la imagen del producto
            const originalImg = cardElement.querySelector('.product-card__image');
            const cloneImg = clone.querySelector('.product-card__image');
            
            console.log('🖼️ Imagen original:', {
                src: originalImg?.src,
                complete: originalImg?.complete,
                naturalWidth: originalImg?.naturalWidth,
                naturalHeight: originalImg?.naturalHeight
            });
            
            // Convertir imagen a data URL para evitar CORS
            if (originalImg && originalImg.complete) {
                try {
                    console.log('🔄 Convirtiendo imagen a data URL...');
                    const dataUrl = await this.imageToDataURL(originalImg);
                    cloneImg.src = dataUrl;
                    console.log('✅ Imagen convertida a data URL');
                } catch (err) {
                    console.warn('⚠️ No se pudo convertir imagen a data URL:', err);
                }
            }
            
            wrapper.appendChild(clone);
            document.body.appendChild(wrapper);
            
            // Esperar un momento para que se renderice
            await new Promise(resolve => setTimeout(resolve, 100));
            
            console.log('📐 Dimensiones wrapper:', {
                width: wrapper.offsetWidth,
                height: wrapper.offsetHeight
            });
            
            // Importar html2canvas
            console.log('📦 Cargando html2canvas...');
            const html2canvas = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');
            console.log('✅ html2canvas cargado');
            
            // Capturar
            const options = {
                backgroundColor: '#F9FAFB',
                scale: 2,
                logging: false,
                useCORS: false,
                allowTaint: true,
                width: wrapper.offsetWidth,
                height: wrapper.offsetHeight
            };
            
            console.log('📸 Capturando con opciones:', options);
            const canvas = await html2canvas.default(wrapper, options);
            
            console.log('✅ Canvas creado:', {
                width: canvas.width,
                height: canvas.height
            });
            
            // Limpiar
            document.body.removeChild(wrapper);
            
            // Restaurar botón
            if (button) {
                button.style.display = originalButtonDisplay;
                console.log('👁️ Botón restaurado');
            }
            
            // Convertir a blob
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob && blob.size > 1000) {
                        console.log('✅ Blob creado, tamaño:', blob.size, 'bytes');
                        resolve(blob);
                    } else {
                        console.error('❌ Blob inválido o muy pequeño');
                        reject(new Error('Error al crear el blob de la imagen'));
                    }
                }, 'image/png', 0.95);
            });
            
        } catch (error) {
            console.error('❌ ERROR COMPLETO:', error);
            console.error('❌ Stack:', error.stack);
            
            // Restaurar botón en caso de error
            if (button) {
                button.style.display = originalButtonDisplay;
            }
            
            throw error;
        }
    }
    
    /**
     * Convierte una imagen a Data URL para evitar problemas CORS
     * @param {HTMLImageElement} img - Imagen a convertir
     * @returns {Promise<string>} - Data URL de la imagen
     */
    static async imageToDataURL(img) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            } catch (error) {
                reject(error);
            }
        });
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
