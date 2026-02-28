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
            wrapper = document.createElement('div');
            wrapper.style.cssText = `
                position: fixed;
                top: -9999px;
                left: -9999px;
                padding: 50px 30px;
                background: linear-gradient(135deg, #E9D5FF 0%, #F3E8FF 100%);
                display: inline-block;
            `;
            
            // CLONAR la card (no moverla!)
            const cardClone = cardElement.cloneNode(true);
            console.log('Card clonada');
            
            // Convertir imágenes externas a Data URLs usando proxy CORS
            const images = cardClone.querySelectorAll('img');
            console.log('Convirtiendo', images.length, 'imagenes a Data URL con proxy...');
            
            for (const img of images) {
                try {
                    if (img.src && !img.src.startsWith('data:')) {
                        console.log('Convirtiendo imagen:', img.src.substring(0, 50));
                        
                        // Usar proxy CORS para cargar la imagen
                        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(img.src)}`;
                        const dataUrl = await this.fetchImageAsDataURL(proxyUrl);
                        img.src = dataUrl;
                        
                        console.log('Imagen convertida OK');
                    }
                } catch (err) {
                    console.warn('No se pudo convertir imagen:', err);
                    // Si falla, intentar sin proxy
                    try {
                        const dataUrl = await this.fetchImageAsDataURL(img.src);
                        img.src = dataUrl;
                    } catch (err2) {
                        console.error('Falló completamente:', err2);
                    }
                }
            }
            
            // Remover botón del clon
            const clonedButton = cardClone.querySelector('.product-card__button');
            if (clonedButton) {
                clonedButton.remove();
                console.log('Boton removido del clon');
            }
            
            // Forzar estilos de categoría para centrado vertical
            const clonedCategory = cardClone.querySelector('.product-card__category');
            if (clonedCategory) {
                clonedCategory.style.cssText = `
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 8px 16px !important;
                    line-height: 1 !important;
                    height: auto !important;
                    min-height: 32px !important;
                    vertical-align: middle !important;
                `;
                console.log('Categoría con centrado forzado');
            }
            
            // Forzar box-shadow en la card para que html2canvas la capture
            cardClone.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)';
            console.log('Box-shadow forzado en card clonada');
            
            wrapper.appendChild(cardClone);
            document.body.appendChild(wrapper);
            console.log('📦 Wrapper y clon agregados al DOM');
            
            // Esperar renderizado (más tiempo para las imágenes convertidas)
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('Espero 300ms para que carguen las imagenes Data URL');
            
            // Importar html2canvas (más estable que dom-to-image)
            console.log('Cargando html2canvas...');
            const html2canvas = (await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.min.js')).default;
            console.log('html2canvas cargado:', html2canvas);
            
            // Capturar con html2canvas
            console.log('INICIANDO CAPTURA...');
            const canvas = await html2canvas(wrapper, {
                backgroundColor: '#f9f6fdff',
                scale: 2,
                useCORS: false,
                allowTaint: true,
                logging: false
            });
            console.log('Canvas creado:', canvas.width, 'x', canvas.height);
            
            // Convertir canvas a blob
            const blob = await new Promise((resolve) => {
                canvas.toBlob((b) => resolve(b), 'image/png', 0.95);
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
            
            console.error('DETALLES DEL ERROR:', errorDetails);
            
            // Mostrar error con opción de copiar
            const userMessage = `Error al capturar o compartir la imagen.\n\n${errorDetails}\n\nPor favor, copia este mensaje y compártelo con el desarrollador.`;
            alert(userMessage);
            
            return false;
        }
    }
}
